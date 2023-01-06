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
import saveNovoContractABI from '../../public/abi.json';

const saveNovoContractAddress = '0xbc3b0ce71b5edd18d4a7d80d3bef1a40211e67ad' as `0x${string}`;

const saveNovoContract = {
  address: saveNovoContractAddress,
  abi: saveNovoContractABI,
};

const formatAmount = (balance: number, decimals: number = 0) => balance?.toLocaleString('en-US', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
}) || 0;

const GlobalStyle = createGlobalStyle`
  body {
    background-color: rgba(0, 0, 0, 0.99);
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
  color: white;
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

const Title = styled.a`
  margin-bottom: 10px;
  font-weight: bold;
  color: #d60000;
  font-size: 2.4rem;
`;

const Description = styled.div`
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
`;

const FormContainer = styled.div`
  padding: 20px;
  width: auto;
  border: rgba(255, 255, 255, 0.3) solid thin;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  max-width: 400px;
`;

const MintInput = styled.input`
  padding: 5px 10px;
  margin: 10px 0;
  background-color: rgba(255, 255, 255, 0.5);
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
  border: rgba(255, 255, 255, 0.3) solid thin;
  cursor: pointer;
  transition: background 200ms ease;
  &:hover {
    background-color: black;
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

const Backdrop = styled.div`
  background-color: rgba(0, 0, 0, 0.6);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const ExternalLink = styled.a.attrs({
  target: '_blank',
  rel: 'noreferrer'
})``;

const Home: NextPage = () => {
  const [quantity, setQuantity] = React.useState<number>(0);
  const { chain, chains } = useNetwork();
  const isValidChain = chain?.id === validChain.id;
  const { switchNetwork } = useSwitchNetwork();
  const handleSwitchChain = () => switchNetwork?.(validChain.id);
  const { connect } = useConnect();
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
      functionName: 'balanceOf', // Method to be called
      args: [address], // Method arguments - address to be checked for balance
      }
    ],
    watch: true,
  });
  const [totalSupply, tokenPrice, balanceOf] = contractReadValues;
  const totalSupplyNumber = totalSupply?.toString();
  const tokenPriceNumber = tokenPrice && +tokenPrice?.toString() / Math.pow(10, 18);
  const balanceOfNumber = balanceOf?.toString();
  const ethValue = tokenPrice && +tokenPrice?.toString() * quantity;
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
  return (
    <Container>
      <GlobalStyle />
      <Head>
        <title>Save Novo</title>
        <meta name="description" content="Help CryptoNovo get his punk back" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Backdrop />
      <Main>
        <Link href="/">
          <Title>Save Novo</Title>
        </Link>
        <div style={{ marginTop: 35, marginBottom: 40 }}>
        <Punk />          
        </div>
        <FormContainer>
          <div>Mint - { tokenPriceNumber } ETH / token</div>
          <div>Total - {totalSupplyNumber && formatAmount(+totalSupplyNumber) || 'x'} / {formatAmount(576)}</div>
          {address ? (
            <div>You own { balanceOfNumber }</div>
          ) : null}
          <MintInput
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(+e.target.value)}
            placeholder="No max per wallet / tx, go crazy!"
            min={1}
            max={30}
          />
          {!address ? (
            <MintButton onClick={ () => connect() }>Connect wallet</MintButton>
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
          The collection is made of 576 tokens, one for each pixel of punk #3706. Each token can be minted for 0.14 ETH, which will make 80 ETH if we mint it all - the price to purchase #3706 back.<br /><br />
          No royalties, 100% of the proceeds will be sent to a recovery wallet used to get the punk back (<ExternalLink href="https://etherscan.io/address/0xd7da0ae98f7a1da7c3318c32e78a1013c00df935">0xd7da0ae98f7a1da7c3318c32e78a1013c00df935</ExternalLink>).<br /><br />
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