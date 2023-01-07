import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React from 'react'
import styled, { createGlobalStyle } from 'styled-components';
import Link from 'next/link'
import Punk from '../components/Punk'
import {
  useAccount,
  useConnect,
  useContract,
  useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useNetwork,
  useSwitchNetwork
} from 'wagmi'
import { validChain } from '../utils/chain';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { saveNovoContract } from '../utils/contract';
import ExternalLink from '../components/ExternalLink';
import { recoveryWalletAddress } from '../utils/const';
import { shortenAddress } from '../utils';

const formatAmount = (balance: number, decimals: number = 0) => balance?.toLocaleString('en-US', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
}) || 0;

const GlobalStyle = createGlobalStyle`
  body {
    background-color: white;
    min-height: 100vh;
  }
  * {
    box-sizing: border-box;
  }
`;

const Container = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  font-family: 'VT323', monospace;
  pre {
    text-align: left;
  }
  * {
    font-size: 1.4rem;
    input {
      ::placeholder,
      ::-webkit-input-placeholder {
        font-size: 2rem;
        color: rgba(0, 0, 0, 0.3);
      }
    }
  }
  a {
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Title = styled.div`
  margin-bottom: 10px;
  font-weight: bold;
  color: #d60000;
  font-size: 2.4rem;
`;

const Description = styled.div`
  margin-bottom: 20px;
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

  padding: 5px 10px;
  padding-top: 8px;
  margin: 10px 0;
  background-color: rgba(255, 255, 255, 0.5);
  border: rgba(0, 0, 0, 0.3) solid 3px;
  width: 100%;
  ::placeholder,
  ::-webkit-input-placeholder {
    color: rgba(0, 0, 0, 0.3);
  }
`;

const MintButton = styled.button`
  all: unset;
  box-sizing: border-box;
  display: block;
  width: 100%;
  margin: 0;
  background-color: #9b59b6;
  padding: 5px 12px 8px 12px;
  border: rgba(0, 0, 0, 0.3) solid 3px;
  cursor: pointer;
  transition: all 200ms ease;
  &:hover {
    border: rgba(255, 255, 255, 0.2) solid 3px;
  }
`;

const Main = styled.main`
  width: 100%;
  min-height: 100vh;
  max-width: 740px;
  margin: auto;
  padding: 30px 15px;
  position: relative;
`;

const Home: NextPage = () => {
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
    error: readError
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
  const [totalSupply, tokenPrice, maxTokens] = contractReadValues;
  const totalSupplyNumber = Number(totalSupply);
  const tokenPriceNumber = Number(tokenPrice) / Math.pow(10, 18);
  const maxTokensNumber = Number(maxTokens);
  const ethValue = Number(tokenPrice) * (quantity);
  const { config } = usePrepareContractWrite({
    ...saveNovoContract,
    functionName: 'mint',
    args: [
      quantity,
      {
        gasLimit: 1300000,
        value: ethValue
      },
    ],
  })
  const {
    data: mintData,
    isLoading: isMinting,
    isSuccess: isMinted,
    error: mintError,
    write: mint
  } = useContractWrite(config);
  const handleMint = async () => {
    if (!address) return window.alert('You must connect your account to mint.');
    if (!quantity) return window.alert('You must mint at least one token.');
    if (mint) {
      mint();
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
    <Container>
      <GlobalStyle />
      <Head>
        <title>Save Novo</title>
      </Head>
      <Main>
        <Title>Save Novo</Title>
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
          <MintInput
            type="number"
            value={quantity || undefined}
            onChange={(e) => setQuantity(+e.target.value)}
            placeholder="How many?"
            min={1}
            style={{marginTop: 20}}
          />
          {!address ? (
            // <MintButton onClick={handleConnect}>Connect wallet</MintButton>
            <ConnectButton />
          ) : !isValidChain ? (
            <MintButton onClick={ handleSwitchChain }>
              Wrong chain, switch to { validChain.name }
            </MintButton>          
          ) : (
            <MintButton onClick={ handleMint } disabled={ isMinting }>
              { isMinting ? 'Minting...' : 'Mint'}
            </MintButton>              
          )}
          {mintData?.hash ? (
            <div style={{ marginTop: 15 }}>
              <ExternalLink href={`https://goerli.etherscan.io/tx/${mintData?.hash}`} style={{
                color: 'white',
                textDecoration: 'underline'
              }}>
                View TX details
              </ExternalLink>
            </div>
          ) : null}
          {isMinted ? (
            <div style={{ color: 'green', marginTop: 15, display: 'none' }}>
              Minted successfully!
            </div>
          ) : null}
        </FormContainer>
        <Description>
          On January 4th 2023, CryptoNovo <ExternalLink href="https://twitter.com/CryptoNovo311/status/1610485939280744456">got scammed</ExternalLink> and lost most of his NFTs, including his iconic CryptoPunk <ExternalLink href="https://cryptopunks.app/cryptopunks/details/3706">#3706</ExternalLink>.<br /><br />
          This initiative is made to help Novo recover his lost punk, and act as a reminder to be safe out here. Unfortunately, scams still happen everyday. Today it is Novo, tomorrow it could be you.<br /><br />
          The collection is made of {maxTokensNumber} tokens, one for each pixel of punk #3706. Each token can be minted for {tokenPriceNumber} ETH, which will make { formatAmount(tokenPriceNumber * maxTokensNumber, 2) } ETH if we mint it all.<br /><br />
          No royalties, 100% of the proceeds will be sent to a recovery wallet (<ExternalLink href={`https://etherscan.io/address/${recoveryWalletAddress}`}>{ shortenAddress(recoveryWalletAddress) }</ExternalLink>) used to get the punk back.<br /><br />
          Happy minting!<br /><br />
          Love,<br />
          Some punks
        </Description>
        <div>
          <ExternalLink href={ `https://goerli.etherscan.io/address/0xbc3b0ce71b5edd18d4a7d80d3bef1a40211e67ad` }>Contract</ExternalLink>
        </div>
        <div>
          <ExternalLink href="https://testnets.opensea.io/collection/cryptonovo">Opensea</ExternalLink>
        </div>
      </Main>
    </Container>
  )
}

export default Home;