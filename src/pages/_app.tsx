import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { validChain } from '../utils/chain';
 
const { chains, provider, webSocketProvider } = configureChains(
  [validChain],
  [alchemyProvider({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY as string
  })],
)
 
const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider,
  webSocketProvider,
})

function SaveNovoApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </WagmiConfig>
  );
};

export default SaveNovoApp;
