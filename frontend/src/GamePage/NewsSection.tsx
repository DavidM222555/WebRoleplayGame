import * as React from 'react';
import { useEffect, useState } from 'react';
import "./GamePageStyles.css"
import { Chat, ChatHeader, ChatHeaderArea, Column, Message, NewsMessageArea } from './GameStyledComponents';
import WebsocketAPI from '../API';

interface NewsSectionProps {
  API: WebsocketAPI
  title: string;
}

export const NewsSection = (props: NewsSectionProps) => {
  const { title } = props;
  
  const [_lastRefresh, setRefresh] = useState<Date>(new Date());

//   const greenWhiteTheme = {
//     color: "green",
//     bg: "white"
//   };

  useEffect(() => {
    const nmID = props.API.register("NEWS_MESSAGE", (_msg) => {
      setRefresh(new Date());
    });
    const nmuID = props.API.register("NEWS_MESSAGE_UPDATE", (_msgs) => {
      setRefresh(new Date());
    });
    fetchNewsMessages(10);

    return () => {
      props.API.unregister("NEWS_MESSAGE", nmID);
      props.API.unregister("NEWS_MESSAGE_UPDATE", nmuID);
    }
  }, []);

  const fetchNewsMessages = (retries: number = 3) => {
    if (!props.API.isReady(false))
      if (retries > 0)
        setTimeout(() => fetchNewsMessages(retries - 1), 500);
    else
      props.API.FETCH_NEWS_MESSAGES()
  }

  return (
    <Column>
      <ChatHeaderArea>
        <ChatHeader>{title}</ChatHeader>
      </ChatHeaderArea>
      <NewsMessageArea className="unrounded-border">
        {
          props.API.GET_NEWS_MESSAGES().map((msg, index) => {
            return (
              <Chat key={index}>
                <Message>{msg}</Message>
              </Chat>);
          })
        }
      </NewsMessageArea>
    </Column>
  )
}

export default NewsSection;