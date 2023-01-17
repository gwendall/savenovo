import Link from 'next/link';
import { useRouter } from 'next/router';
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

  const { address } = useAccount();
  const router = useRouter();
  const { wallet } = router.query as { wallet: string };
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
      {
        ...saveNovoContract,
        functionName: 'walletOfOwner',
        args: [wallet],
        // enabled: Boolean(address),
      }
    ],
  });
  const [isRevealed, startIndexRaw, walletOfOwner = []] = values as unknown as [boolean, number];
  const activeWalletTokens = (walletOfOwner as any[])?.filter(Boolean).map(Number);

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
        (activeWalletTokens?.includes(+pixel.tokenId)) ||
        clicked === i / 4
      ) {
        pixels[i + 3] = 255;
      } else {
        pixels[i + 3] = 80;
      }
    }

    // Draw the image data on the canvas
    ctx.putImageData(imageData, 0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixelData, width, height, clicked, hovered, JSON.stringify(activeWalletTokens)]);

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
      router.replace('/', undefined, { shallow: true });
    });

    document.body.addEventListener('click', () => {
      setClicked(undefined);
    });

  }, [pixelData, width, height, drawImage]);
  const activePixel = Number.isFinite(clicked) ? pixelData[clicked as number] : null;
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
    data: ensName
  } = useEnsName({
    address: owner as `0x${string}`,
    chainId: mainnet.id,
    enabled: Boolean(owner),
  });
  // const {
  //   data: currentUserWallet = []
  // } = useContractRead({
  //   ...saveNovoContract,
  //   functionName: 'walletOfOwner',
  //   args: [address],
  //   enabled: Boolean(address),
  // });
  // const currentUserWalletValues = (currentUserWallet as any[]).map(Number);
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
            <div>{`Pixel ${isRevealed?' #'+activePixel.tokenId:''} {${activePixel.x},${activePixel.y}}`}</div>
          ) : null}
          {!isRevealed ? (
            <div>The owner will be shown after reveal</div>
          ) : isLoading ? (
            <div>Searching owner...</div>
          ) : owner ? (
            <>
              <div>
                {'Owned by '}
                <Link href={`/?wallet=${owner}`} replace>
                  {owner === address ?
                    'you' :
                    (ensName || shortenAddress(owner))
                  }
                </Link>
              </div>
              <ExternalLink href={`https://opensea.io/assets/${saveNovoContract.address}/${activePixel?.tokenId}`}>
                View on OpenSea
              </ExternalLink>
            </>
          ) : (
            <div>Not minted yet</div>
          )}
        </div>
        ) : (
        <div>Click on a pixel to see its info</div>
      )}
      {isRevealed ? null : (
        <div>The collection is not revealed yet</div>
      )}
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