import * as React from 'react';
import { useState } from 'react';
import "./GamePageStyles.css"
import { Author, Chat, ChatEnterDiv, ChatHeader, ChatHeaderArea, ChatInputAreaDiv, ChatInputDiv, ChatMessageArea, Column, Message, Row } from './GameStyledComponents';
import WebsocketAPI from '../API';

interface ChatSectionProps {
  API: WebsocketAPI;
  title: string;
  type: string;
  playerTeam?: string;
}

export const ChatSection = (props: ChatSectionProps) => {
  const { title, type, playerTeam } = props;
  
  const [msgInput, setMsgInput] = useState<string>("");
  const [_lastRefresh, setRefresh] = useState<Date>(new Date());

  React.useEffect(() => {
    const id = props.API.register("GLOBAL_MESSAGE", (_msg) => {
      setRefresh(new Date());
    });

    // Destructor
    return () => {
      props.API.unregister("GLOBAL_MESSAGE", id);
    };
  }, []); 

  const greenWhiteTheme = {
    color: "green",
    bg: "white"
  };

  const purpleWhiteTheme = {
    color: "purple",
    bg: "white",
  }


  return (
    <Column>
      <ChatHeaderArea>
        <ChatHeader>{title}</ChatHeader>
      </ChatHeaderArea>
      <ChatMessageArea className="unrounded-border">
        {
          type == "public_chat" ?
          props.API.GET_GLOBAL_MESSAGES().map((chat, index) => {
            return (
              <Chat key={index}>
                <Author theme={greenWhiteTheme}>{chat.author}:</Author>
                <Message>{chat.message}</Message>
              </Chat>
              );
          }) : type == "team_chat" ? props.API.GET_TEAM_MESSAGES().map((chat, index) => {
            if (playerTeam == chat.team) {
              return (
                <Chat key={index}>
                  <Author theme={purpleWhiteTheme}>{chat.author}:</Author>
                  <Message>{chat.message}</Message>
                </Chat>
              );
            }
            else {
              return null;
            }
          }) : null
        }
      </ChatMessageArea>
      <ChatInputAreaDiv>
        <Row>
          <ChatInputDiv>
            <input 
              className="chat-textarea"
              type="text"
              value={msgInput}
              onChange={(event) => setMsgInput(event.target.value)}
              placeholder="Enter message"
            />
          </ChatInputDiv>
          <ChatEnterDiv>
            <button 
              className="chat-submit-button"
              onClick={() => {
                if (msgInput.trim() !== "") {
                  switch (type) {
                    case "public_chat":
                      props.API.SEND_GLOBAL_MESSAGE(msgInput);
                      setMsgInput("");
                      break;
                    case "team_chat":
                      props.API.SEND_TEAM_MESSAGE(msgInput, playerTeam ? playerTeam : "");
                      setMsgInput("");
                      break;
                    default:
                      break;
                  }
                }
              }}
            >Proclaim</button>
          </ChatEnterDiv>
        </Row>
      </ChatInputAreaDiv>
    </Column>
  )
}

export default ChatSection;