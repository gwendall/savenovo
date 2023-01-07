import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiConfig, createClient, configureChains, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { validChain } from '../utils/chain';
 
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

const { chains, provider, webSocketProvider } = configureChains(
  [validChain, mainnet],
  [alchemyProvider({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY as string
  })],
)

const { connectors } = getDefaultWallets({
  appName: 'Save Novo',
  chains
});

const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
})

function SaveNovoApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider chains={chains}>
        {/* @ts-ignore */}
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default SaveNovoApp;
