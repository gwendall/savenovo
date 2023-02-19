import { useAccount, useContractReads } from "wagmi";
import { useBurnableContract } from "../contracts/burnable";
import { useRedeemContractAddress } from "../contracts/redeem";
import useBurnableTokenId from "./useBurnableTokenId";

const useIsBurnableApprovedForAll = () => {
  const { address } = useAccount();
  const burnableContract = useBurnableContract();
  const redeemContractAddress = useRedeemContractAddress();
  const contracts = [
    {
      ...burnableContract,
      functionName: 'isApprovedForAll',
      args: [address, redeemContractAddress],
      // enabled: Boolean(address),
    },
  ];
  const {
    data: readContractValues = [],
    isError,
    isLoading,
    error: readError,
    refetch: refetchContractReads,
  } = useContractReads({
    contracts,
    watch: true,
  });
  const [
    isApprovedForAll,
    // redeemTotalSupply
  ] = readContractValues;
  return isApprovedForAll;
}

export default useIsBurnableApprovedForAll;