import React = require("react");
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Navbar = styled.div`
  width: 95%;
  height: fit-content;

  border: 2px solid black;

  background-color: #0a9600;

  padding: 5px;
  margin: 3px;
`;
const Navitem = styled.div`
  display: inline;
  width: fit-content;

  border: 2px solid #000000;
  border-radius: 2px;

  background-color: #FFEEDD;

  padding: 1px;
  margin: 3px;
`;

export default ()=>{
    return (
        <Navbar>
        {"Welcome to the site! Currently under construction!"}
        <nav>
          <Navitem>
            <Link to="/">Home</Link>
          </Navitem>
          <Navitem>
            <Link to="/chatdemo">Chat</Link>
          </Navitem>
          <Navitem>
            <Link to="/dev">Dev</Link>
          </Navitem>
          <Navitem>
            <Link to="/game">Game</Link>
          </Navitem>
          <Navitem>
            <Link to="/lobby">Lobby</Link>
          </Navitem>
          <Navitem>
            <Link to="/publicLobby">Public Lobby</Link>
          </Navitem>
        </nav>
      </Navbar>
    )
}










