export type EthereumAddress = `0x${string}`;

export const shortenAddress = (address: EthereumAddress) => address.slice(2).slice(0, 6);

export const formatAmount = (balance: number, decimals: number = 0) => balance?.toLocaleString('en-US', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
}) || 0;
