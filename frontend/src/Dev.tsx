import * as React from 'react';
import WebsocketAPI from './API';
import { useEffect, useState } from 'react';
import { Redirect } from 'react-router';
// import styled from 'styled-components';


export const Dev = (props: { API: WebsocketAPI }) => {
  const [user, setUser] = useState(props.API.address);
  const [name, setName] = useState("");
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    // Set up callbacks
    const ncID = props.API.register("NAME_CHANGE", (name: string) => {
      setUser(name);
    });
    const jlID = props.API.register("JOIN_LOBBY", (_event) => {
      setRedirect(true);
    });

    return () => {
      // Remove on leave
      props.API.unregister("NAME_CHANGE", ncID);
      props.API.unregister("JOIN_LOBBY", jlID);
    }
  }, [])

  return (
    <div>
      <div>Welcome to Revolution, { user }</div>
      <br/>

      <button 
        onClick={() => {props.API.SEND_PUBLIC_LOBBY_REQUEST();}}
      >Join Lobby</button>
      <br/>

      { redirect ? <Redirect to="/lobby"/> : null }

      <div>
        <input
          id="username-input"
          type="text"
          onChange={(val) => setName(val.currentTarget.value)}
        />
        <button
          type="submit"
          onClick={() => {props.API.REQUEST_NAME(name);}}
        >Change Name</button>
      </div>
    </div>
  )
}

export default Dev;