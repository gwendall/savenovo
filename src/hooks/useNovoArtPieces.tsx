import axios from "axios";
import { useQuery } from "react-query";
import { goerli, mainnet, useAccount, useNetwork } from "wagmi";
import { useRedeemContractAddress } from "../contracts/redeem";

const useReservoirBaseURL = () => {
  const { chain } = useNetwork();
  if (chain?.id === mainnet.id) return 'https://api.reservoir.tools';
  if (chain?.id === goerli.id) return 'https://api-goerli.reservoir.tools';
};

const useNovoArtPieces = () => {
    const { address } = useAccount();
    const baseURL = useReservoirBaseURL();
    const redeemContractAddress = useRedeemContractAddress();
    const query = useQuery({
        queryKey: ["tokens", baseURL, redeemContractAddress],
        queryFn: () => axios.get(`/users/${address}/tokens/v6`, {
            baseURL,
            headers: {
                withCredentials: false,
                ['x-api-key']: 'a6fd6fb8-564f-5b46-8e12-b02134cfd70e',
            },
            params: {
                collection: redeemContractAddress,
                limit: 200
            }
        }).then(({ data }) => data?.tokens || []),
        keepPreviousData: true,
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 5,
        enabled: Boolean(address) && Boolean(redeemContractAddress),
    });
    return query;
}

export default useNovoArtPieces;