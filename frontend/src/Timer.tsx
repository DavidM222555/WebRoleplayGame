import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const CircleDiv = styled.div`
  height: 25px;
  width: 25px;  
  border-radius: 25px;
  text-align: center;

  border: 2px solid black;
`;

export interface TimerProps {
  seconds: number;
  restart: boolean;
  onExpire: () => void;
  onTick: (s: number) => void;
};
export const defaultTimerProps = {
  seconds: 10,
  restart: false,
  onExpire: () => console.log("Timer expired"),
  onTick: (s: number) => console.log(`Timer: ${s} seconds left`)
};

export const Timer = (props: TimerProps = defaultTimerProps) => {
  const [time, setTime] = useState<number>(props.seconds);
  const [ticking, setTicking] = useState<boolean>(true);

  useEffect(() => {
    if (time == 0) {
      props.onExpire();
      if (props.restart)
        setTicking(true);
    }

    if (time > 0 && ticking)
      setTimeout(() => {
        setTime(time-1);
        props.onTick(time-1);
      }, 1000);
    else if (ticking || time !== 0) {
      setTicking(false);
      setTime(0);
    }
  }, [time]);
  useEffect(() => {
    if (!ticking && time !== 0)
      setTime(0)
    else
      setTime(props.seconds);
  }, [ticking]);

  return (
    <CircleDiv>
      {time}
    </CircleDiv>
  )
}

export default Timer;