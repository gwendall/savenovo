import type { GetServerSideProps, NextPage } from 'next'
import Image from 'next/image'
import React from 'react'
import styled, { createGlobalStyle } from 'styled-components';
import Link from 'next/link'
import {
  useAccount,
  useConnect,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useNetwork,
  useSwitchNetwork,
  useWaitForTransaction
} from 'wagmi'
import { validChain } from '../utils/chain';
import { saveNovoContract, saveNovoContractAddress } from '../utils/contract';
import { recoveryWalletAddress } from '../utils/const';
import { formatAmount, shortenAddress } from '../utils';
import ExternalLink from '../components/ExternalLink';
import Button, { buttonHeight } from '../components/Button';
import Head from '../components/Head';
import Punk from '../components/Punk';
import CustomConnectButton from '../components/CustomConnectButton';
import Leaderboard from '../components/Leaderboard';
import useEstimateGas from '../hooks/useEstimateGas';

const Description = styled.div`
  margin: 20px 0;
  margin-top: 40px;
  text-align: left;
`;

const FormContainer = styled.div`
  padding: 20px;
  width: auto;
  border: rgba(255, 255, 255, 0.3) solid thin;
  background-color: rgba(0, 0, 0, 1);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  max-width: 400px;
`;

const MintInput = styled.input`
  all: unset;
  box-sizing: border-box;
  height: ${buttonHeight}px;
  margin: 10px 0;
  margin-top: 20px;
  background-color: rgba(255, 255, 255, 0.5);
  border: rgba(0, 0, 0, 0.3) solid 3px;
  width: 100%;
  font-size: inherit;
  ::placeholder,
  ::-webkit-input-placeholder {
    color: rgba(0, 0, 0, 0.3);
    font-size: inherit;
    font-weight: bold;
  }
`;

const NovoPixels = () => {
  const [quantity, setQuantity] = React.useState<number>(0);
  const { chain, chains } = useNetwork();
  const isValidChain = chain?.id === validChain.id;
  const { switchNetwork } = useSwitchNetwork();
  const handleSwitchChain = () => switchNetwork?.(validChain.id);
  const { connect, connectors } = useConnect();
  const handleConnect = () => connect?.();
  const { address } = useAccount();
  const {
    data: contractReadValues = [],
    isError,
    isLoading,
    error: readError,
    refetch: refetchContractReads,
  } = useContractReads({
    contracts: [
      {
        ...saveNovoContract,
        functionName: 'totalSupply',
      },
      {
        ...saveNovoContract,
        functionName: 'tokenPrice',
      },
      {
        ...saveNovoContract,
        functionName: 'MAX_TOKENS',
      },
    ],
    watch: true,
  });
  const {
    data: balanceOfData,
    refetch: refetchBalance,
  } = useContractReads({
    contracts: [
      {
        ...saveNovoContract,
        functionName: 'balanceOf',
        args: [address],
      }
    ],
    enabled: Boolean(address),
    watch: true,
  });
  const onMintSuccess = () => {
    refetchContractReads();
    refetchBalance();
  }
  const [totalSupply, tokenPrice, maxTokens] = contractReadValues;
  const [balanceOf] = balanceOfData || [];
  const totalSupplyNumber = Number(totalSupply);
  const tokenPriceNumber = Number(tokenPrice) / Math.pow(10, 18);
  const maxTokensNumber = Number(maxTokens);
  const balanceOfNumber = Number(balanceOf);
  const ethValue = Number(tokenPrice) * (quantity);
  const {
    data: estimation,
    error: errrorEstimating
  } = useEstimateGas(saveNovoContract, 'mint', [
    quantity,
    {
      value: ethValue + ''
    }
  ]);
  const estimationNumber = Number(estimation);
  const { config } = usePrepareContractWrite({
    ...saveNovoContract,
    functionName: 'mint(uint256)',
    enabled: Boolean(address),
    args: [
      quantity,
      {
        gasLimit: errrorEstimating ? 800000 : estimationNumber + 8000,
        value: ethValue + ''
      },
    ],
    onSuccess: onMintSuccess
  });
  const {
    data: mintData,
    isLoading: isAskingForConfirmation,
    error: mintError,
    write: mint,
  } = useContractWrite(config);
  const {
    isLoading: isMinting,
    isSuccess: isMinted,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });
  const handleMint = async () => {
    if (!address) return window.alert('You must connect your account to mint.');
    if (!quantity) return window.alert('You must mint at least one token.');
    if (quantity > maxTokensNumber - totalSupplyNumber) return window.alert('You can mint up to ' + (maxTokensNumber - totalSupplyNumber) + ' tokens');
    if (mint) {
      mint();
    } else {
      window.alert('Something went wrong, please try later.');
    }
  };
  React.useEffect(() => {
    const errorMessage = mintError?.message || readError?.message;
    if (errorMessage) {
      if (errorMessage.includes('insufficient funds')) {
        window.alert("You don't have enough eth to cover for the minting price + gas fees");
      } else {
        window.alert(errorMessage);
      }
    }
  }, [readError, mintError]);
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return (
    <>
        <div style={{ marginTop: 35, marginBottom: 40 }}>
          <Punk />
        </div>
        <FormContainer>
          {isLoading ? (
            <div>-</div>
          ) : (
            <>
              <div>Price - {tokenPriceNumber} ETH / token</div>
              {maxTokensNumber === totalSupplyNumber ? (
                <div>Sold out!</div>
              ) : (
                <div>Available - {formatAmount(maxTokensNumber - totalSupplyNumber) || 'x'} / {formatAmount(maxTokensNumber)} ({formatAmount(totalSupplyNumber/maxTokensNumber*100)}% minted)</div>              
              )}
            </>
          )}
          {address && balanceOfNumber > 0 ? (
            <ExternalLink href={ `https://opensea.io/collection/novopixels` }>
              <div>You own {balanceOfNumber} pixel{balanceOfNumber>1?'s':''}</div>
            </ExternalLink>
          ) : null}
          {maxTokensNumber === totalSupplyNumber ? null : (
            <>
              <MintInput
                type="number"
                value={quantity || undefined}
                onChange={(e) => setQuantity(+e.target.value)}
                placeholder="Enter the # of tokens to mint"
                min={1}
              />
              {!address ? (
                <CustomConnectButton />
              ) : !isValidChain ? (
                <Button onClick={ handleSwitchChain }>
                  Wrong chain, switch to { validChain.name }
                </Button>          
              ) : (
                <Button onClick={ handleMint } disabled={ isAskingForConfirmation || isMinting }>
                  { isAskingForConfirmation ? 'Confirming the transaction...' : isMinting ? 'Minting, hold on a few seconds...' : 'Mint'}
                </Button>              
              )}
            </>
          )}
          {mintData?.hash ? (
            <div style={{ marginTop: 15 }}>
              <ExternalLink href={`https://etherscan.io/tx/${mintData?.hash}`} style={{
                color: 'white',
                textDecoration: 'underline'
              }}>
                View TX details
              </ExternalLink>
            </div>
          ) : null}
          {isMinted ? (
            <div style={{ color: 'green', marginTop: 15 }}>
              Successfully minted!
            </div>
          ) : null}
        </FormContainer>
        <Description>
          On January 4th, 2023, CryptoNovo <ExternalLink href="https://twitter.com/CryptoNovo311/status/1610485939280744456">was scammed</ExternalLink> and lost most of his NFTs, including the iconic CryptoPunk <ExternalLink href="https://cryptopunks.app/cryptopunks/details/3706">#3706</ExternalLink>.<br /><br />
          This initiative is meant to help Novo recover his lost punk and serve as a reminder to be cautious out here. Unfortunately, scams still occur everyday. Today it is Novo, but tomorrow it could be you.<br /><br />
          The collection consists of {maxTokensNumber} on-chain tokens, one for each pixel of punk #3706. Each token can be minted for {tokenPriceNumber} ETH, totaling { formatAmount(tokenPriceNumber * maxTokensNumber, 2) } ETH if all are minted.<br /><br />
          No royalties, 100% of the proceeds will be sent to a recovery wallet (<ExternalLink href={`https://etherscan.io/address/${recoveryWalletAddress}`}>{shortenAddress(recoveryWalletAddress)}</ExternalLink>) to be used to get the punk back. For now, { formatAmount(tokenPriceNumber * totalSupplyNumber, 2) } ETH have been raised through the collection.<br /><br />
          To make things more exciting, tokens will be randomly assigned after the reveal, once everything is minted. Maybe you will get the red nose, who knows!<br /><br />
          Happy minting!<br /><br />
          Love,<br /><br />
          Some punks
          <br /><ExternalLink href="https://twitter.com/gwendall">gwendall</ExternalLink> & <ExternalLink href="https://twitter.com/franknft_eth">franknft_eth</ExternalLink>
          <br /><br />Find the status of the fundraise and other initiatives to get the punk back on  <Link href="/">SaveNovo</Link>.
        </Description>
        <Leaderboard />
        <div>
          <ExternalLink href={ `https://etherscan.io/address/${saveNovoContractAddress}` }>Contract</ExternalLink>
        </div>
        <div>
          <ExternalLink href="https://opensea.io/collection/novopixels">Opensea</ExternalLink>
        </div>
    </>
  )
}

export default NovoPixels;