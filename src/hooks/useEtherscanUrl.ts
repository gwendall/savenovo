import { goerli, mainnet, useNetwork } from 'wagmi';

const useEtherscanUrl = () => {
  const { chain } = useNetwork();
  if (chain?.id === mainnet.id) return 'https://etherscan.io';
  if (chain?.id === goerli.id) return 'https://goerli.etherscan.io';
};

export default useEtherscanUrl;