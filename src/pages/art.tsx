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
  useWaitForTransaction,
  mainnet,
  goerli,
  useSigner
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
import { useBurnableContract, useBurnableContractAddress } from '../contracts/burnable';
import { useRedeemContract, useRedeemContractAddress } from '../contracts/redeem';
import useBurnableTokenId from '../hooks/useBurnableTokenId';
import useEtherscanUrl from '../hooks/useEtherscanUrl';
import useOpenseaUrl from '../hooks/useOpenseaUrl';
import useNovoArtPieces from '../hooks/useNovoArtPieces';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';

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

const ApproveButton = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const burnableContract = useBurnableContract();
  const redeemContractAddress = useRedeemContractAddress();
  const { config } = usePrepareContractWrite({
    ...burnableContract,
    functionName: 'setApprovalForAll',
    args: [
      redeemContractAddress,
      true,
    ],
  });
  const {
    data: approvalData,
    isLoading: isAskingForConfirmation,
    error: approvalError,
    write: setApprovalForAll,
  } = useContractWrite(config);
  const {
    isLoading: isApproving,
    isSuccess: isApproved,
  } = useWaitForTransaction({
    hash: approvalData?.hash,
  });
  const handleApprove = async () => {
    console.log('running setApprovalForAll', {
      config,
      setApprovalForAll,
    })
    if (!address) return window.alert('You must connect your account to set approval.');
    if (setApprovalForAll) {
      setApprovalForAll();
    } else {
      window.alert('Something went wrong, please try later.');
    }
  };
  React.useEffect(() => {
    const errorMessage = approvalError?.message;
    if (errorMessage) {
      if (errorMessage.includes('insufficient funds')) {
        window.alert("You don't have enough eth to cover for the minting price + gas fees");
      } else {
        window.alert(errorMessage);
      }
    }
  }, [approvalError]);
  return (
    <Button onClick={handleApprove}>{ isApproving ? 'Approving...' : 'Approve' }</Button>
  )
};

const PiecesListContainer = styled.div`
  display: grid;
  grid-gap: 25px;
  /* grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); */
  grid-template-columns: repeat(2, 1fr);
  margin: 15px 0;
`;

const PieceItemContainer = styled.div`
  /* background-color: rgba(0, 0, 0, 0.1); */
  border: rgba(0, 0, 0, 0.3) solid thin;
  @media(hover: hover) {
    :hover {
      border: red solid thin;
    }
  }
  span,
  img {
    width: 100%;
  }
  img {}
`;

const PieceItemImage = styled(LazyLoadImage)`
  span,
  img {
    width: 100%;
  }
`;

const PieceItemText = styled.div`
  padding: 15px;
`;

const PieceItem = ({ token }: any) => {
  const openseaUrl = useOpenseaUrl();
  const url = `${openseaUrl}/assets/${token?.token?.contract}/${token?.token?.tokenId}`;
  return (
    <ExternalLink href={url}>
      <PieceItemContainer>
        <PieceItemImage
          src={token?.token?.image}
          alt="image"
          effect="opacity"
        />
        <PieceItemText>
          <div>{token?.token?.name}</div>
          <div>x{token?.ownership?.tokenCount}</div>
        </PieceItemText>
      </PieceItemContainer>
    </ExternalLink>
  );
};

const PiecesList = ({ tokens = [] }) => (
  <PiecesListContainer>
    {tokens.map((token) => (
      <PieceItem token={token} key={`token-${JSON.stringify(token)}`} />
    ))}
  </PiecesListContainer>
);

const NovoArt = () => {
  const [quantity, setQuantity] = React.useState<number>(0);
  const { chain, chains } = useNetwork();
  const isValidChain = chain?.id === validChain.id;
  const { switchNetwork } = useSwitchNetwork();
  const handleSwitchChain = () => switchNetwork?.(validChain.id);
  const { connect, connectors } = useConnect();
  const handleConnect = () => connect?.();
  const { address } = useAccount();
  const burnableTokenId = useBurnableTokenId();
  const burnableContract = useBurnableContract();
  const burnableContractAddress = useBurnableContractAddress();
  const redeemContract = useRedeemContract();
  const redeemContractAddress = useRedeemContractAddress();
  const contracts = [
    {
      ...burnableContract,
      functionName: 'balanceOf', // Method to be called
      args: [address, burnableTokenId], // Method arguments - address to be checked for balance
      // enabled: Boolean(address),
    },
    {
      ...burnableContract,
      functionName: 'isApprovedForAll',
      args: [address, redeemContractAddress],
      // enabled: Boolean(address),
    },
    // {
    //   ...redeemContract,
    //   functionName: 'totalSupply', // Method to be called
    // }
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
  const onMintSuccess = () => {
    refetchContractReads();
  }
  const [
    burnableBalanceOf,
    isApprovedForAll,
    // redeemTotalSupply
  ] = readContractValues;
  const burnableBalanceOfNumber = Number(burnableBalanceOf);
  // const redeemTotalSupplyNumber = Number(redeemTotalSupply);
  // const {
  //   data: estimation,
  //   error: errrorEstimating
  // } = useEstimateGas(redeemContract, 'exchange', [
  //   quantity,
  // ]);
  // const estimationNumber = Number(estimation);
  // console.log('Read contract values.', {
  //   readContractValues,
  //   contracts,
  //   burnableBalanceOfNumber,
  //   quantity,
  //   isApprovedForAll,
  // });
  const { config } = usePrepareContractWrite({
    ...redeemContract,
    functionName: 'exchange(uint256)',
    enabled: Boolean(address),
    args: [
      quantity,
      {
        // gasLimit: errrorEstimating ? 800000 : estimationNumber + 8000,
        gasLimit: 800000,
      },
    ],
    onSuccess: onMintSuccess
  });
  const {
    data: exchangeData,
    isLoading: isAskingForConfirmation,
    error: exchangeError,
    write: exchangeToken,
  } = useContractWrite(config);
  const {
    isLoading: isMinting,
    isSuccess: isMinted,
  } = useWaitForTransaction({
    hash: exchangeData?.hash,
  });
  const handleMint = async () => {
    if (!address) return window.alert('You must connect your account to mint.');
    if (!quantity) return window.alert('You must mint at least one token.');
    if (quantity > burnableBalanceOfNumber) return window.alert('You can mint up to ' + burnableBalanceOfNumber + ' tokens');
    if (exchangeToken) {
      exchangeToken();
    } else {
      window.alert('Something went wrong, please try later.');
    }
  };
  React.useEffect(() => {
    const errorMessage = exchangeError?.message || readError?.message;
    if (errorMessage) {
      if (errorMessage.includes('insufficient funds')) {
        window.alert("You don't have enough eth to cover for the minting price + gas fees");
      } else {
        window.alert(errorMessage);
      }
    }
  }, [readError, exchangeError]);
  const {
    data: tokens = [],
    // isLoading: isLoadingArtPieces,
    isFetching: isLoadingArtPieces,
  } = useNovoArtPieces();
  const piecesOwnedCount = tokens
    .reduce((sum: number, { ownership }: any = {}) => sum + (+ownership?.tokenCount || 0), 0);
  const etherscanUrl = useEtherscanUrl();
  const openseaUrl = useOpenseaUrl();
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return (
    <>
      <FormContainer>
        {isLoading ? (
          <div>-</div>
        ) : !address ? (
          <CustomConnectButton />
        ) : !isApprovedForAll ? (      
          <>
              <div>You must approve this token</div>
              <ApproveButton />
          </>
        ) : (
          <div>You can redeem {formatAmount(burnableBalanceOfNumber) || 'x'} pieces</div>              
        )}
        {address && isApprovedForAll && burnableBalanceOfNumber > 0 ? (
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
        ) : null}
        {exchangeData?.hash ? (
          <div style={{ marginTop: 15 }}>
            <ExternalLink href={`${etherscanUrl}/tx/${exchangeData?.hash}`} style={{
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
      {!address ? null : false ? (
        <div>Loading pieces...</div>
      ) : (
          <div style={{
            marginTop: 30,
            marginBottom: 30,
        }}>
            <div>{`You own ${piecesOwnedCount} piece${piecesOwnedCount > 1 ? 's' : ''}`}</div>
            <PiecesList tokens={tokens} />
            {/* <pre>{ JSON.stringify(tokens, null, 2)}</pre> */}
        </div>
      )}
      <div>
        <ExternalLink href={ `${etherscanUrl}/address/${burnableContractAddress}` }>Burn contract</ExternalLink>
      </div>
      <div>
        <ExternalLink href={ `${etherscanUrl}/address/${redeemContractAddress}` }>Redeem contract</ExternalLink>
      </div>
      {/* <div>
        <ExternalLink href={ `${openseaUrl}/collection/novopixels` }>Opensea</ExternalLink>
      </div>
      <div>
        <ExternalLink href={ `https://metahood.xyz/contract/${redeemContractAddress}` }>Metahood</ExternalLink>
      </div> */}
    </>
  )
}

export default NovoArt;