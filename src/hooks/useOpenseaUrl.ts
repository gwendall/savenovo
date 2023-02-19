import { goerli, mainnet, useNetwork } from 'wagmi';

const useOpenseaUrl = () => {
  const { chain } = useNetwork();
  if (chain?.id === mainnet.id) return 'https://opensea.io';
  if (chain?.id === goerli.id) return 'https://testnets.opensea.io';
};

export default useOpenseaUrl;