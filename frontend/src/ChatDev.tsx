import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import WebsocketAPI from './API';

const MessageBox = styled.div`
  width: 100%;
  height: fit-content;

  border: 2px solid black;

  background-color: #EEEEEE;

  padding: 5px;
  margin: 5px;

`;
const LastRefreshed = styled.i`
  margin: 5px 0px 15px 0px;

  font-size: x-small;
`
const Chat = styled.div`
  margin: 5px 0px;
`
const Author = styled.b`
  color: ${props => props.theme.color ? props.theme.color : "black"};
  border: 1px solid ${props => props.theme.color ? props.theme.color : "black"};
  border-radius: 2px;

  background-color: ${props => props.theme.bg ? props.theme.bg : "grey"};

  padding: 1px;
  margin: 5px;

  font-size: medium;
`;
const Message = styled.p`
  height: fit-content;

  margin: 1px;

  display: inline-block;

  font-size: medium;
`;

const greenWhiteTheme = {
  color: "green",
  bg: "white"
};

export const BasicChatBox = (props: {API: WebsocketAPI}) => {
  const [input, setInput] = useState<string>("");
  const [last_refresh, setRefresh] = useState<Date>(new Date());
  
  useEffect(() => {
    const id = props.API.register("GLOBAL_MESSAGE", (_msg) => {
      setRefresh(new Date());
    });

    // Destructor
    return () => {
      props.API.unregister("GLOBAL_MESSAGE", id);
    };
  }, []);

  return (
    <div>
      <MessageBox>
        <LastRefreshed>Last Refreshed: {last_refresh.toUTCString()}</LastRefreshed>
        {
          props.API.GET_GLOBAL_MESSAGES().map((chat, index) => {
            return (
              <Chat key={index}>
                <Author theme={greenWhiteTheme}>{chat.author}:</Author>
                <Message>{chat.message}</Message>
              </Chat>);
          })
        }
      </MessageBox>

      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Enter message"
      />
      <button 
        onClick={() => {
          props.API.SEND_GLOBAL_MESSAGE(input);
          setInput("");}
        }
      >Send Chat</button>
    </div>
  )
}

export default BasicChatBox;