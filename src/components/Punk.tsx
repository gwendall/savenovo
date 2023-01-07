import React from 'react';
import { mainnet, useAccount, useContractRead } from 'wagmi';
import data from '../../public/novo.json';
import { saveNovoContract } from '../utils/contract';
import ExternalLink from './ExternalLink';

type Pixel = {
  color: string;
  x: number;
  y: number;
};

const ImageFromJSON: React.FC<{
  pixelData: Pixel[];
  width: number;
  height: number;
}> = ({ pixelData, width, height }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [hovered, setHovered] = React.useState<number>();
  const [clicked, setClicked] = React.useState<number>();

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
  const activePixel = Number.isFinite(clicked) && pixelData[clicked as number];
  const {
    data: owner,
    isLoading,
  } = useContractRead({
    ...saveNovoContract,
    functionName: 'ownerOf',
    args: [Number(clicked)],
    enabled: Number.isInteger(clicked),
  });
  const { address } = useAccount();
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
      {activePixel ? (
        <div onClick={(e) => {
          e.stopPropagation();
        }}>
          <div>{`Pixel #${clicked} {${activePixel.x},${activePixel.y}}`}</div>
          {isLoading ? (
            <div>Searching owner...</div>
          ) : owner ? (
            <div>Owned by <ExternalLink href={`https://etherscan.io/address/${owner}`}>{ owner === address ? 'you' : (owner as `0x${string}`).slice(2).slice(0, 6) }</ExternalLink></div>
          ): (
            <div>Not minted yet</div>
          )}
        </div>
      ) : null}
    </>
  );
};

const Punk = () => (
  <div style={
    {
      imageRendering: 'pixelated',
    } 
  }>
    <ImageFromJSON pixelData={ data } width={ 24 } height={ 24 } />
  </div>
);

export default Punk;