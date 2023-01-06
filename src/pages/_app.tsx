import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { validChain } from '../utils/chain';
 
const { chains, provider, webSocketProvider } = configureChains(
  [validChain],
  [alchemyProvider({ apiKey: 'kzbtTrwRoPKa7G_NMn48mx_tyzDDjxa9' })],
)
 
const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider,
  webSocketProvider,
})

const SaveNovoApp = ({ Component, pageProps }: AppProps) => (
  <WagmiConfig client={client}>
    <Component {...pageProps} />
  </WagmiConfig>
);

export default SaveNovoApp;
