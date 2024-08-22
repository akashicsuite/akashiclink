import { datadogRum } from '@datadog/browser-rum';
import {
  type ITransactionProposal,
  type ITransactionVerifyResponse,
  keyError,
  L2Regex,
  TransactionLayer,
} from '@helium-pay/backend';

import type { ValidatedAddressPair } from '../../components/send-deposit/send-form/types';
import { useAppSelector } from '../../redux/app/hooks';
import { selectCacheOtk } from '../../redux/slices/accountSlice';
import { selectFocusCurrencyDetail } from '../../redux/slices/preferenceSlice';
import { OwnersAPI } from '../api';
import {
  convertFromDecimals,
  convertObjectCurrencies,
  convertToFromDecimals,
} from '../currency';
import { calculateInternalWithdrawalFee } from '../internal-fee';
import { Nitr0genApi, signTxBody } from '../nitr0gen/nitr0gen-api';
import { unpackRequestErrorMessage } from '../unpack-request-error-message';
import { useAccountMe } from './useAccountMe';
import { useExchangeRates } from './useExchangeRates';
import { useAccountStorage } from './useLocalAccounts';

export const useVerifyTxnAndSign = () => {
  const { chain, token } = useAppSelector(selectFocusCurrencyDetail);
  const cacheOtk = useAppSelector(selectCacheOtk);
  const { activeAccount } = useAccountStorage();
  const { exchangeRates } = useExchangeRates();
  const { data: account } = useAccountMe();

  return async (validatedAddressPair: ValidatedAddressPair, amount: string) => {
    const isL2 = L2Regex.exec(validatedAddressPair?.convertedToAddress);
    const nitr0genApi = new Nitr0genApi();

    try {
      if (!cacheOtk || !activeAccount || !account) {
        return 'GenericFailureMsg';
      }

      let txns: ITransactionVerifyResponse[];

      if (isL2) {
        // AC needs smallest units, so we convert
        const transactionData: ITransactionProposal = {
          initiatedToNonL2: !L2Regex.exec(
            validatedAddressPair.userInputToAddress
          )
            ? validatedAddressPair.userInputToAddress
            : undefined,
          toAddress: validatedAddressPair.convertedToAddress,
          amount: convertToFromDecimals(amount, chain, 'to', token),
          coinSymbol: chain,
          tokenSymbol: token,
        };
        if (activeAccount.identity === transactionData.toAddress)
          throw new Error(keyError.noSelfSend);

        const txBody = await nitr0genApi.L2Transaction(
          cacheOtk,
          transactionData
        );
        // Convert back to "normal" units for displaying to user
        txns = [
          {
            ...convertObjectCurrencies(transactionData, convertFromDecimals),
            internalFee: {
              withdraw: calculateInternalWithdrawalFee(
                exchangeRates,
                chain,
                token
              ),
            },
            layer: TransactionLayer.L2,
            fromAddress: activeAccount.identity,
            txToSign: txBody,
          },
        ];

        return {
          txns,
          signedTxns: [txBody],
        };
      } else {
        // Backend accepts "normal" units, so we don't convert
        const transactionData: ITransactionProposal = {
          toAddress: validatedAddressPair.convertedToAddress,
          amount,
          coinSymbol: chain,
          tokenSymbol: token,
        };

        txns = await OwnersAPI.verifyTransactionUsingClientSideOtk(
          transactionData
        );
      }

      // reject the request if /verify returns multiple transfers
      // for L2: multiple transactions from the same Nitr0gen identity can always be combined into a single one
      if ((!isL2 && txns.length > 1) || txns.length === 0) {
        return 'GenericFailureMsg';
      }

      // sign txns and move to final confirmation
      // Okay to assert since we have filtered out on the line before
      const signedTxns = await Promise.all(
        txns
          .filter((res) => !!res.txToSign)
          .map((res) => signTxBody(res.txToSign!, cacheOtk))
      );

      return { txns, signedTxns };
    } catch (error) {
      datadogRum.addError(error);
      return unpackRequestErrorMessage(error);
    }
  };
};
