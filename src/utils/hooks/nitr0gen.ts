import { Preferences } from '@capacitor/preferences';
import { datadogRum } from '@datadog/browser-rum';
import type { IBaseAcTransaction } from '@helium-pay/backend';
import {
  type ITransactionProposalClientSideOtk,
  type ITransferNftResponse,
  nftErrors,
  TransactionLayer,
  TransactionStatus,
} from '@helium-pay/backend';

import { useAppDispatch } from '../../redux/app/hooks';
import { addLocalTransaction } from '../../redux/slices/localTransactionSlice';
import type { ITransactionSettledResponse } from '../nitr0gen/nitr0gen.interface';
import { Nitr0genApi } from '../nitr0gen/nitr0gen-api';
import { useValueOfAmountInUSDT } from './useExchangeRates';

export const useSendL2Transaction = () => {
  const nitr0genApi = new Nitr0genApi();
  const dispatch = useAppDispatch();
  const valueOfAmountInUSDT = useValueOfAmountInUSDT();

  const trigger = async (
    signedTransactionData: ITransactionProposalClientSideOtk
  ): Promise<ITransactionSettledResponse> => {
    try {
      const txHash = (
        await nitr0genApi.sendTransaction(() =>
          nitr0genApi.sendSignedTx(signedTransactionData.signedTx)
        )
      ).$umid;

      const hideSmallTransactions = await Preferences.get({
        key: 'hide-small-balances',
      });

      const {
        fromAddress,
        toAddress,
        initiatedToNonL2,
        coinSymbol,
        tokenSymbol,
        amount,
        internalFee,
      } = signedTransactionData;

      const usdtValue = valueOfAmountInUSDT(amount, coinSymbol, tokenSymbol);

      // Only store locally if we are not hiding the transaction
      if (
        (hideSmallTransactions && usdtValue.gte(1)) ||
        !hideSmallTransactions
      ) {
        dispatch(
          addLocalTransaction({
            fromAddress,
            toAddress,
            senderIdentity: fromAddress,
            receiverIdentity: toAddress,
            coinSymbol,
            tokenSymbol,
            l2TxnHash: txHash,
            initiatedAt: new Date(),
            status: TransactionStatus.CONFIRMED,
            layer: TransactionLayer.L2,
            amount,
            internalFee,
            initiatedToNonL2,
          })
        );
      }

      return {
        isSuccess: true,
        txHash,
      };
    } catch (error) {
      return {
        isSuccess: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
  return { trigger };
};

export const useSendL1Transaction = () => {
  const nitr0genApi = new Nitr0genApi();
  const dispatch = useAppDispatch();
  const valueOfAmountInUSDT = useValueOfAmountInUSDT();

  const trigger = async (
    signedTransactionData: ITransactionProposalClientSideOtk
  ): Promise<ITransactionSettledResponse> => {
    try {
      const l2TxnHash = (
        await nitr0genApi.sendTransaction(() =>
          nitr0genApi.sendSignedTx(signedTransactionData.signedTx)
        )
      ).$umid;

      const hideSmallTransactions = await Preferences.get({
        key: 'hide-small-balances',
      });

      const { identity } = signedTransactionData;

      const usdtValue = valueOfAmountInUSDT(
        signedTransactionData.amount,
        signedTransactionData.coinSymbol,
        signedTransactionData.tokenSymbol
      );

      // Only store locally if we are not hiding the transaction
      if (
        (hideSmallTransactions && usdtValue.gte(1)) ||
        !hideSmallTransactions
      ) {
        dispatch(
          addLocalTransaction({
            ...signedTransactionData,
            status: TransactionStatus.PENDING,
            initiatedAt: new Date(),
            layer: TransactionLayer.L1,
            l2TxnHash,
            senderIdentity: identity,
          })
        );
      }

      return {
        isSuccess: true,
        txHash: l2TxnHash,
      };
    } catch (error) {
      return {
        isSuccess: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
  return { trigger };
};

export const useNftTransfer = () => {
  const nitr0genApi = new Nitr0genApi();

  const trigger = async (
    signedTx: IBaseAcTransaction
  ): Promise<
    Omit<ITransferNftResponse, 'nftName' | 'ownerIdentity' | 'acnsAlias'>
  > => {
    const response = await nitr0genApi.sendSignedTx(signedTx);
    nitr0genApi.checkForNitr0genError(response);

    return {
      txHash: response.$umid,
    };
  };
  return { trigger };
};

export const useUpdateAcns = () => {
  const nitr0genApi = new Nitr0genApi();

  const trigger = async (
    signedTx: IBaseAcTransaction
  ): Promise<{ txHash: string }> => {
    try {
      const response = await nitr0genApi.sendSignedTx(signedTx);
      nitr0genApi.checkForNitr0genError(response);

      return {
        txHash: response.$umid,
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error(nftErrors.linkingAcnsFailed);
      datadogRum.addError(error);
      throw err;
    }
  };
  return { trigger };
};
