import { Core } from '@walletconnect/core';
import { buildApprovedNamespaces } from '@walletconnect/utils';
import type { Web3WalletTypes } from '@walletconnect/web3wallet';
import { type IWeb3Wallet, Web3Wallet } from '@walletconnect/web3wallet';
import { useEffect, useState } from 'react';
import type { Chain } from 'viem';

export const initWeb3Wallet = async () => {
  const core = new Core({
    projectId: process.env.REACT_APP_WC_PROJECT_ID,
  });

  return await Web3Wallet.init({
    core,
    metadata: {
      name: 'Akashic Wallet',
      description: 'Akashic Wallet',
      url: 'https://www.akashicwallet.com',
      icons: ['https://avatars.githubusercontent.com/u/37784886'],
    },
  });
};

export const buildApproveSessionNamespace = ({
  sessionProposal,
  chain,
  l1Address,
}: {
  sessionProposal: Web3WalletTypes.SessionProposal;
  chain: Chain;
  l1Address: string;
}) => {
  const namespaces = {
    proposal: sessionProposal.params,
    supportedNamespaces: {
      eip155: {
        chains: [`eip155:${chain.id}`],
        methods: [
          'eth_requestAccounts',
          'eth_accounts',
          'eth_signTypedData_v4',
          'eth_sendTransaction',
          'personal_sign',
        ],
        events: [
          'accountsChanged',
          'chainChanged',
          'message',
          'disconnect',
          'connect',
        ],
        accounts: [`eip155:${chain.id}:${l1Address}`],
      },
    },
  };

  return buildApprovedNamespaces(namespaces);
};

export const useWeb3Wallet = () => {
  const [web3wallet, setWeb3Wallet] = useState<IWeb3Wallet>();

  useEffect(() => {
    const init = async () => {
      const w = await initWeb3Wallet();
      setWeb3Wallet(w);
    };

    init();
  }, []);

  return web3wallet;
};
