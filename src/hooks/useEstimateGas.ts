import { BigNumber } from "ethers";
import React from "react";
import { useContract, useSigner } from "wagmi";
import { saveNovoContract } from "../utils/contract";

const useEstimateGas = (methodName: string, params: any[]) => {
    const [data, setData] = React.useState<number | undefined>(0);
    const [error, setError] = React.useState<Error>();
    const { data: signer } = useSigner();
    const contract = useContract({
        ...saveNovoContract,
        signerOrProvider: signer,
    });
    const handleSuccess = (_data: BigNumber) => {
        setError(undefined);
        setData(Number(_data));
    };
    const handleError = (_error: Error) => {
        setError(_error);
        setData(undefined);
    };
    React.useEffect(() => {
        if (contract) {
            setError(undefined);
            setData(undefined);
            contract.estimateGas?.[methodName]?.(...params)
                .then(handleSuccess)
                .catch(handleError);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract, methodName, JSON.stringify(params)]);
    return {
        data,
        error,
    };
};

export default useEstimateGas;