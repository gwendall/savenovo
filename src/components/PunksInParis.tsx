import React from "react";
import useSound from "use-sound";

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
        <div>ok ok</div>
    );
}

export default PunksInParis;