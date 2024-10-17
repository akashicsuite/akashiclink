import { datadogRum } from '@datadog/browser-rum';
import type {
  CoinSymbol,
  CurrencySymbol,
  IBaseAcTransaction,
} from '@helium-pay/backend';
import {
  type IWithdrawalProposal,
  keyError,
  L2Regex,
  TransactionLayer,
} from '@helium-pay/backend';

import type { ValidatedAddressPair } from '../../components/send-deposit/send-form/types';
import { OwnersAPI } from '../api';
import {
  convertFromSmallestUnit,
  convertObjectCurrencies,
  convertToSmallestUnit,
} from '../currency';
import { calculateInternalWithdrawalFee } from '../internal-fee';
import type {
  ITransactionForSigning,
  L2TxDetail,
} from '../nitr0gen/nitr0gen.interface';
import { Nitr0genApi, signTxBody } from '../nitr0gen/nitr0gen-api';
import { unpackRequestErrorMessage } from '../unpack-request-error-message';
import { useAccountMe } from './useAccountMe';
import { useExchangeRates } from './useExchangeRates';
import { useAccountStorage } from './useLocalAccounts';

export interface UseVerifyAndSignResponse {
  /** The signed txn sent to the chain. NOTE: the monetary amounts are in the
   * smallest, indivisible units, which is not typical for client code. */
  signedTxn: IBaseAcTransaction;
  /** The txn with extra contextual data, useful for caching */
  txn: ITransactionForSigning;
  /** The delegated fee, if any. In UI units (in contrast to the txn) */
  delegatedFee?: string;
}

export const useVerifyTxnAndSign = () => {
  const { activeAccount } = useAccountStorage();
  const { exchangeRates } = useExchangeRates();
  const { data: account } = useAccountMe();
  const { cacheOtk } = useAccountStorage();

  return async (
    validatedAddressPair: ValidatedAddressPair,
    amount: string,
    coinSymbol: CoinSymbol,
    tokenSymbol?: CurrencySymbol
  ): Promise<string | UseVerifyAndSignResponse> => {
    const isL2 = L2Regex.exec(validatedAddressPair?.convertedToAddress);
    const nitr0genApi = new Nitr0genApi();

    try {
      if (!cacheOtk || !activeAccount || !account) {
        return 'GenericFailureMsg';
      }

      if (isL2) {
        const l2TransactionData: L2TxDetail = {
          initiatedToNonL2: !L2Regex.exec(
            validatedAddressPair.userInputToAddress
          )
            ? validatedAddressPair.userInputToAddress
            : undefined,
          toAddress: validatedAddressPair.convertedToAddress,
          initiatedToL1LedgerId: validatedAddressPair.initiatedToL1LedgerId,
          // Backend accepts "normal" units, so we don't convert
          amount,
          coinSymbol,
          tokenSymbol,
        };
        if (activeAccount.identity === l2TransactionData.toAddress)
          throw new Error(keyError.noSelfSend);

        const txBody = await nitr0genApi.L2Transaction(
          cacheOtk,
          // AC needs smallest units, so we convert
          convertObjectCurrencies(l2TransactionData, convertToSmallestUnit)
        );

        const txn: ITransactionForSigning = {
          ...l2TransactionData,
          identity: activeAccount.identity,
          internalFee: {
            withdraw: calculateInternalWithdrawalFee(
              exchangeRates,
              coinSymbol,
              tokenSymbol
            ),
          },
          layer: TransactionLayer.L2,
          fromAddress: activeAccount.identity,
          txToSign: txBody,
        };

        return {
          txn,
          signedTxn: txBody,
        };
      }

      const transactionData: IWithdrawalProposal = {
        identity: activeAccount.identity,
        toAddress: validatedAddressPair.convertedToAddress,
        // Backend accepts "normal" units, so we don't convert
        amount,
        coinSymbol,
        tokenSymbol,
      };

      const { preparedTxn, fromAddress, delegatedFee } =
        await OwnersAPI.prepareL1Txn(transactionData);
      const signedTxn = await signTxBody(preparedTxn, cacheOtk);
      const uiFeesEstimate = convertFromSmallestUnit(
        preparedTxn.$tx.metadata?.feesEstimate ?? '0',
        coinSymbol
      );
      const txn: ITransactionForSigning = {
        identity: activeAccount.identity,
        fromAddress,
        toAddress: validatedAddressPair.convertedToAddress,
        amount,
        coinSymbol,
        tokenSymbol,
        feesEstimate: uiFeesEstimate,
        layer: TransactionLayer.L1,
        txToSign: signedTxn,
      };

      return { txn, signedTxn, delegatedFee };
    } catch (error) {
      datadogRum.addError(error);
      return unpackRequestErrorMessage(error);
    }
  };
};
