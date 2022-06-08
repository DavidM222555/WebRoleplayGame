import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Dev from './Dev';

import "../public/favicon.ico";
import GamePage from './GamePage/GamePage';
import HomePage from './HomePage/HomePage';
import LoginPage from './LoginPage/LoginPage';
import LobbyPage from './LobbyPage';
import PublicLobby from './PublicLobby/PublicLobby';
import { Account } from './UserAuth/AccountWrapper';
import CustomNavbar from './CustomNavbar/CustomNavbar';

// Create the "API" for the front-end to use
import WebsocketAPI from "./API";
import ChatDev from './ChatDev';

// A global component that always redirects to "persistent" pages a user should always be on
//   such as the lobby and game pages
export const RedirectWhenNeeded = (props: { API: WebsocketAPI }) => {

  const lobbyState = props.API.getLobbyStateString();

  if (lobbyState == "LOBBY") return <Redirect to="/lobby" />;
  if (lobbyState == "GAME") return <Redirect to="/game" />;

  return null;
}

const Index = () => {
  const [API] = React.useState<WebsocketAPI>(new WebsocketAPI(process.env.WEBSOCKET_URL ? process.env.WEBSOCKET_URL : "ws://localhost:8000"));

  return (
    <Router>
      <CustomNavbar />
      <RedirectWhenNeeded API={API} />
      <Switch>
        <Route path="/dev">
          <Dev API={API} />
        </Route>
        <Route path="/chatdemo">
          <ChatDev API={API} />
        </Route>
        <Route path="/game">
          <GamePage API={API} />
        </Route>
        <Route path="/publicLobby">
          <PublicLobby />
          <div>
            TEST!
          </div>
          "{API.lobby}"
        </Route>
        <Route path="/login">
          <LoginPage API={API}/>
        </Route>
        <Route path="/lobby">
          <LobbyPage API={API} />
        </Route>
        <Route path="/">
          <Account>
            <HomePage API={API}/>
          </Account>
        </Route>

      </Switch>
    </Router>
  )
}

ReactDOM.render(
  <Index />,
  document.getElementById('root')
);