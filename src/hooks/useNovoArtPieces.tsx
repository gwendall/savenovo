import axios from "axios";
import { useQuery } from "react-query";
import { goerli, mainnet, useAccount, useNetwork } from "wagmi";
import { useRedeemContractAddress } from "../contracts/redeem";

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY;

const useAlchemyBaseURL = () => {
  const { chain } = useNetwork();
  if (!ALCHEMY_API_KEY) return null;
  if (chain?.id === mainnet.id) return `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;
  if (chain?.id === goerli.id) return `https://eth-goerli.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}`;
  return null;
};

const useNovoArtPieces = () => {
    const { address } = useAccount();
    const baseURL = useAlchemyBaseURL();
    const redeemContractAddress = useRedeemContractAddress();
    const query = useQuery({
        queryKey: ["tokens", baseURL, redeemContractAddress, address],
        queryFn: async () => {
            if (!baseURL || !address || !redeemContractAddress) return [];

            const response = await axios.get(`${baseURL}/getNFTsForOwner`, {
                params: {
                    owner: address,
                    'contractAddresses[]': redeemContractAddress,
                    withMetadata: true,
                }
            });

            // Transform Alchemy response to match expected format
            const nfts = response.data?.ownedNfts || [];
            return nfts.map((nft: any) => ({
                token: {
                    tokenId: nft.tokenId,
                    name: nft.name || nft.title,
                    image: nft.image?.cachedUrl || nft.image?.originalUrl || nft.raw?.metadata?.image,
                    collection: {
                        name: nft.contract?.name,
                    },
                    ...nft
                }
            }));
        },
        keepPreviousData: true,
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 5,
        enabled: Boolean(address) && Boolean(redeemContractAddress) && Boolean(baseURL),
    });
    return query;
}

export default useNovoArtPieces;
