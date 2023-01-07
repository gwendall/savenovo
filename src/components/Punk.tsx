import React from 'react';
import { mainnet, useAccount, useContractRead, useContractReads, useEnsName } from 'wagmi';
import PixelData from '../../public/novo.json';
import { EthereumAddress, shortenAddress } from '../utils';
import { saveNovoContract } from '../utils/contract';
import ExternalLink from './ExternalLink';

type Pixel = {
  color: string;
  x: number;
  y: number;
  tokenId?: number;
};

const CurrentUserBalance = () => {
  const { address } = useAccount();
  const {
    data: balanceOf,
  } = useContractRead({
    ...saveNovoContract,
    functionName: 'balanceOf', // Method to be called
    args: [address], // Method arguments - address to be checked for balance
    enabled: Boolean(address),
  });
  const balanceOfNumber = Number(balanceOf);
  return (
    <>
      {address && balanceOfNumber > 0 ? (
        <ExternalLink href={ `https://testnets.opensea.io/collection/cryptonovo` }>
          <div>You own {balanceOfNumber} pixel{balanceOfNumber>1?'s':''}</div>
        </ExternalLink>
      ) : null}
    </>
  )
};

const assignTokenIds = (objects: any[], startIndex: number) => {
  for (let i = 0; i < objects.length; i++) {
    const index = (startIndex + i) % objects.length;
    if (objects[index]) objects[index].tokenId = i;
  }
  return objects;
}

const ImageFromJSON: React.FC<{
  pixelData: Pixel[];
  width: number;
  height: number;
}> = ({
  pixelData: _pixelData,
  width,
  height,
}) => {

  const {
    data: values = [],
  } = useContractReads({
    contracts: [
      {
        ...saveNovoContract,
        functionName: 'revealed',
      },
      {
        ...saveNovoContract,
        functionName: 'getOffset',
      },
    ],
  });
  const [isRevealed, startIndexRaw] = values as unknown as [boolean, number];
  const startIndex = Number(startIndexRaw);

  const pixelData = assignTokenIds(_pixelData, startIndex);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [hovered, setHovered] = React.useState<number>();
  const [clicked, setClicked] = React.useState<number>();
  const [selectedWallet, setSelectedWallet] = React.useState<string>();

  const drawImage = React.useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Create an image data object with the same size as the canvas
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    // Loop through the pixel data and set the color values for each pixel
    for (let i = 0; i < pixels.length; i += 4) {
      const pixel = pixelData[i / 4];
      pixels[i] = parseInt(pixel.color.substring(1, 3), 16);
      pixels[i + 1] = parseInt(pixel.color.substring(3, 5), 16);
      pixels[i + 2] = parseInt(pixel.color.substring(5, 7), 16);
      if (
        (Number.isInteger(hovered) && hovered === i / 4) ||
        (!Number.isInteger(hovered) && !Number.isInteger(clicked)) ||
        clicked === i / 4
      ) {
        pixels[i + 3] = 255;
      } else {
        pixels[i + 3] = 80;
      }
    }

    // Draw the image data on the canvas
    ctx.putImageData(imageData, 0, 0);
  }, [pixelData, width, height, clicked, hovered]);

  React.useEffect(() => { 
    drawImage();
  }, [drawImage, hovered, clicked]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    drawImage();

    const getEventCoordinates = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / rect.width * canvas.width);
      const y = Math.floor((event.clientY - rect.top) / rect.height * canvas.height);
      const index = pixelData.findIndex((pixel) => pixel.x === x && pixel.y === y);
      return { x, y, index };
    };

    canvas.addEventListener('mousemove', (event) => {
      const { index } = getEventCoordinates(event);
      setHovered(index);
    });

    canvas.addEventListener('mouseleave', () => {
      setHovered(undefined);
    });

    canvas.addEventListener('click', (event) => {
      event.stopPropagation();
      const { index } = getEventCoordinates(event);
      setClicked(index);
    });

    document.body.addEventListener('click', () => {
      setClicked(undefined);
    });

  }, [pixelData, width, height, drawImage]);
  const activePixel = Number.isFinite(clicked) ? pixelData[clicked as number] : null;
  const { address } = useAccount();
  const {
    data: contractReadValues = [],
    isLoading,
  } = useContractReads({
    contracts: [
      {
        ...saveNovoContract,
        functionName: 'ownerOf',
        args: [Number(activePixel?.tokenId)],
      },
    ],
    enabled: Number.isInteger(activePixel?.tokenId),
  });
  const [owner] = contractReadValues as unknown as [EthereumAddress];
  const {
    data: currentUserWallet = []
  } = useContractRead({
    ...saveNovoContract,
    functionName: 'walletOfOwner',
    args: [address],
    enabled: Boolean(address),
  });
  const currentUserWalletValues = (currentUserWallet as any[]).map(Number);
  const {
    data: ensName
  } = useEnsName({
    address: owner as `0x${string}`,
    chainId: mainnet.id,
    enabled: Boolean(owner),
  });
  return (
    <>
      <canvas
        ref={ canvasRef }
        width={ width }
        height={ height }
        style={
          {
            width: 300,
            height: 300,
            transform: 'scale(1)',
            position: 'relative',
          } 
        }
      />
      {Number.isInteger(clicked) ? (
        <div onClick={(e) => {
          e.stopPropagation();
        }}>
          {activePixel ? (
            <div>{`Pixel ${isRevealed?' #'+activePixel.tokenId:''}{${activePixel.x},${activePixel.y}}`}</div>
          ) : null}
          {!isRevealed ? (
            <div>The owner will be shown after reveal</div>
          ) : isLoading ? (
            <div>Searching owner...</div>
          ) : owner ? (
            <>
              <div>Owned by <ExternalLink href={`https://etherscan.io/address/${owner}`}>{ owner === address ? 'you' : (ensName || shortenAddress(owner)) }</ExternalLink></div>
              <ExternalLink href={`https://testnets.opensea.io/assets/${saveNovoContract.address}/${activePixel?.tokenId}`}>
                View on OpenSea
              </ExternalLink>
            </>
          ) : (
            <div>Not minted yet</div>
          )}
        </div>
      ) : isRevealed ? (
        <div>Click on a pixel to see its owner</div>
        ) : (
        <div>The collection is not revealed yet</div>
      )}
      <CurrentUserBalance />
    </>
  );
};

const Punk = () => (
  <div style={
    {
      imageRendering: 'pixelated',
    } 
  }>
    <ImageFromJSON pixelData={ PixelData } width={ 24 } height={ 24 } />
  </div>
);

export default Punk;