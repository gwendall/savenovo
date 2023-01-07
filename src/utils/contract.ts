import saveNovoContractABI from '../../public/abi.json';
import { validChain } from './chain';

export const saveNovoContractAddress = '0xbc3b0ce71b5edd18d4a7d80d3bef1a40211e67ad' as `0x${string}`;

export const saveNovoContract = {
  address: saveNovoContractAddress,
  abi: saveNovoContractABI,
  chainId: validChain.id,
};
