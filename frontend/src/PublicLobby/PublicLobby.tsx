import React = require("react");
import { Row } from "react-bootstrap";
// import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import "./PublicLobbyStyles.css"

// import LoginPage from "../LoginPage/LoginPage";
// import NewUser from "../NewUser/NewUser";

export const PublicLobby = () => {
    // homepage code blah blah
    return (
      
    <Row style={{
      backgroundColor: '#769485'
    }}>
           <div
            className ="title-format"
           ><br/>Public Lobby<br/><br/></div>

           <div><br/><br/></div>

            <div><br/></div>
            <button 
              className="customButton"
              onClick={() => {
                console.log("to be added");
              }}
            >Join Lobby</button>

            <div><br/></div>
            <button 
              className="customButton"
              onClick={() => {
                console.log("to be added");
              }}
            >Private Match</button>

            <div><br/></div>
            <button 
              className="customButton"
              onClick={() => {
                console.log("to be added");
              }}
            >Exit</button>
            <br/><br/>
            <br/><br/>
            <br/><br/>
            <br/><br/>
            <br/><br/>
            <br/><br/>
            <br/><br/>
    </Row>
      )
  }
  
  export default PublicLobby