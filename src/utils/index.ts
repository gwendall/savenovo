export type EthereumAddress = `0x${string}`;

export const shortenAddress = (address: EthereumAddress) => address.slice(2).slice(0, 6);