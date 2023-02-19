import { goerli, mainnet, useNetwork } from 'wagmi';

const useBurnableTokenId = () => {
  const { chain } = useNetwork();
  if (chain?.id === mainnet.id) return 1;
  if (chain?.id === goerli.id) return 24;
};

export default useBurnableTokenId;