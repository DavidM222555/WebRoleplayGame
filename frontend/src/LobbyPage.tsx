import * as React from 'react';
import API, { Lobby } from './API';
import { useState } from 'react';
import { Redirect } from 'react-router';


export interface LobbyPageProps {
  API: API
}

export const LobbyPage = (props: LobbyPageProps) => {
  const [lobbyCode, _setCode] = useState<string | undefined>(props.API.lobbyCode);
  const [lobby, setLobby] = useState<Lobby | undefined>(props.API.lobby);
  const [ready, setReady] = useState<boolean>(false);
  const [needsGameRedirect, setRedirect] = useState<boolean>(false);

  React.useEffect(() => {
    const lcID = props.API.register("LOBBY_CHANGE", (updatedLobby) => {
      setLobby({
        connected: updatedLobby.connected,
        game: updatedLobby.game,
        playerMax: updatedLobby.playerMax,
        ready: updatedLobby.ready
      });
    });
    const sgID = props.API.register("START_GAME", (_event) => {
      setRedirect(true);
    });

    return () => {
      props.API.unregister("LOBBY_CHANGE", lcID);
      props.API.unregister("START_GAME", sgID);
    }
  }, [])

  return (
    <div>
      <h2><b>Lobby Page</b></h2>
      <br/>
      <div style={{marginTop: 15}}>
        <br/>
        Code: <b>{ lobbyCode }</b>
        <br/>
        { lobby ? 
          (<div style={{marginTop: 5}}>
            { lobby.connected.length } / { lobby.playerMax } Players ({ lobby.ready?.length || 0 } Ready)
            <br/>
            <ul>
              { lobby.connected.map((name: string, i) => (
                <li key={i}>{ name }</li>
              )) }
            </ul>
          </div>)
          : <Redirect to="/"/>
        }
        { needsGameRedirect ? <Redirect to="/game"/> : null }

        <br/>
        <button
          style={{ 
            color: 'black',
            backgroundColor: 'red'
          }}
          onClick={() => {
            props.API.LEAVE_LOBBY();
            setLobby(undefined);
          }}
        >Leave</button>
        { ready ? <button style={{ color: 'gray', backgroundColor: 'lightgreen'}} disabled>Ready!</button>: 
          <button
            style={{
              color: 'black',
              backgroundColor: 'lightgreen'
            }}
            onClick={() => {
              props.API.SEND_READY_UP_REQUEST();
              setReady(true);
            }}
          >Ready</button>
        }   
      </div>
    </div>
  );
}

export default LobbyPage;