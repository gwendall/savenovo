import React, { useState, useEffect } from 'react';

const CountdownTimer: React.FC<{
    targetDate: string;
}> = ({
    targetDate
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>();

  useEffect(() => {
    const targetTime = new Date(targetDate).getTime();
    const currentTime = new Date().getTime();

    setTimeRemaining(targetTime - currentTime);

    const intervalId = setInterval(() => {
      const updatedTime = new Date().getTime();
      setTimeRemaining(targetTime - updatedTime);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  if (!Number.isInteger(timeRemaining)) {
    return <>Loading...</>;
  }

  if (Number(timeRemaining) < 0) {
    return <>Time is up</>;
  }

  const seconds = Math.floor((Number(timeRemaining) / 1000) % 60);
  const minutes = Math.floor((Number(timeRemaining) / 1000 / 60) % 60);
  const hours = Math.floor((Number(timeRemaining) / (1000 * 60 * 60)) % 24);
  const days = Math.floor(Number(timeRemaining) / (1000 * 60 * 60 * 24));

  return (
    <>
      {`Time left to raise: `}
      {
        [
            `${days} days`,
            `${hours} hours`,
            `${minutes} minutes`,
            `${seconds} seconds`
        ].join(', ')
      }
    </>
  );
}

export default CountdownTimer;