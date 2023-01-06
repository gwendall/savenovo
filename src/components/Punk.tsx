import React from 'react';
import data from '../../public/novo.json';

const ImageFromJSON = ({ pixelData, width, height }) => {
  const canvasRef = React.useRef(null);

  const [hovered, setHovered] = React.useState<number>(null);
  const [clicked, setClicked] = React.useState<number>(null);

  const drawImage = React.useCallback(() => {
    const ctx = canvasRef.current.getContext('2d');
      
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
    canvas.width = width;
    canvas.height = height;
    drawImage();

    const getEventCoordinates = (event) => {
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
      setHovered(null);
    });

    canvas.addEventListener('click', (event) => {
      event.stopPropagation();
      const { index } = getEventCoordinates(event);
      setClicked(index);
    });

    document.body.addEventListener('click', () => {
      setClicked(null);
    });

  }, [pixelData, width, height, drawImage]);

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
            // left: '50%',
            // top: '50%',
            // margin: 'auto',
          } 
        }
      />
      {/* <pre>
        { JSON.stringify({ hovered, clicked, data: pixelData[clicked] }, null, 2) }
      </pre> */}
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

/*
export const punkData = data.reduce((acc, { color }, index) => {
  let colorIndex = acc.colors.indexOf(color);
  if (colorIndex === -1) { 
    colorIndex = acc.colors.length;
    acc.colors.push(color);
  }
  acc.tokens[index] = colorIndex;
  return acc;
}, {
  tokens: [],
  colors: [],
});
const punkBytes = data.map(({ color }) => parseInt(color.replace('#', ''), 16));
console.log('Got punk bytes', punkBytes);
console.log(Array.from(new Set(data.map(({ color }) => color).sort())));
*/

/*
const image = new Image();
image.src = 'https://cryptopunks.app/public/images/cryptopunks/punk3706.png';

image.onload = function() {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set the canvas to the same size as the image
  canvas.width = image.width;
  canvas.height = image.height;

  // Draw the image on the canvas
  ctx.drawImage(image, 0, 0);

  // Get the pixel data from the canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Create a JSON object to store the pixel data
  const pixelData = [];

  // Loop through all the pixels and extract the color and position data
  for (let i = 0; i < pixels.length; i += 4) {
    // Convert the color values to hexadecimal
    const r = pixels[i].toString(16).padStart(2, '0');
    const g = pixels[i + 1].toString(16).padStart(2, '0');
    const b = pixels[i + 2].toString(16).padStart(2, '0');
    const a = pixels[i + 3].toString(16).padStart(2, '0');

    const color = a === '00' ? '#6c8495' : '#' + r + g + b;

    const pixel = {
      color,
      x: (i / 4) % image.width,
      y: Math.floor((i / 4) / image.width)
    };
    pixelData.push(pixel);
  }

  console.log(pixelData);
};
*/