import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// MST Blockchain Testnet (Chain ID: 91562037)
export const mstTestnet = defineChain({
  id: 91562037,
  name: 'MST Testnet',
  nativeCurrency: {
    name: 'MST',
    symbol: 'MST',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.mstblockchain.com'],
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Storage Contract DApp',
  projectId: 'daf94234e39a6209d9d97eae0d4d13d6',
  chains: [mstTestnet],
  ssr: false,
});
