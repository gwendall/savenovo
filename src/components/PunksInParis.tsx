import React from "react";
import { createGlobalStyle } from "styled-components";
import useSound from "use-sound";

const GlobalStyle = createGlobalStyle`
  body {
    /* 
    background: black;
    color: white; 
    */
  }
`;

const PunksInParis = () => {
    const [playSound, { pause }] = useSound(
        `/punksinparis.mp3`,
        {
        volume: 0.8,
        loop: true, 
        // interrupt: true,
        },
    );
    React.useEffect(() => {
        playSound();
    }, [playSound]);
    return (
        <>
            <GlobalStyle />
            <div>ok ok</div>
        </>
    );
}

export default PunksInParis;