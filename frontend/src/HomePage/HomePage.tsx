import React = require("react");
//import { Row } from "react-bootstrap";
import { useContext } from "react";
import "./HomePageStyles.css"

import LoginPage from "../LoginPage/LoginPage";
import NewUser from "../NewUser/NewUser";

import CheckIfLoggedIn from "../UserAuth/CheckIfLoggedIn";

import { AccountContext } from "../UserAuth/AccountWrapper";
import WebsocketAPI from '../API';

import {
  Row,
  Column,
  BackgroundDiv,
  Navbar,
  Title,
} from "./HomePageComponents";
import "./HomePageStyles.css";


export const HomePage = (props: { API: WebsocketAPI }) => {
  // homepage code blah blah
  
  const { logout } = useContext(AccountContext);
  
  return (
    <BackgroundDiv>
      <Row>
        <Navbar>
          <div className="centerDiv">
          <CheckIfLoggedIn
        showIfLoggedIn={<>
          <button className="customButton" onClick={() => { logout() }}>Logout</button>
        </>}

        showIfNotLoggedIn={<>
          <div className="linkStyle"><LoginPage API={props.API} /></div>
          <div className="linkStyle"><NewUser />  </div>
        </>}
      />  
            
            
            
              
              
          </div>
        </Navbar>
      </Row>
      <Row>
        <Title>
          <div className="center">Roleplay Game</div>
        </Title>
        <div>
          <br />
          <br />
          <br></br>
        </div>
      </Row>
      <div>
        <br></br>
      </div>
      <Column>
        <button
          className="customButton"
          onClick={() => {
            console.log("to be added");
          }}
        >
          <div className="title-format">Play</div>
        </button>
        <div>
          <br />
        </div>
        <button
          className="customButton"
          onClick={() => {
            console.log("to be added");
          }}
        >
          <div className="title-format">Settings</div>
        </button>

        <div>
          <br />
        </div>
        <button
          className="customButton"
          onClick={() => {
            console.log("to be added");
          }}
        >
          <div className="title-format">How To Play</div>
        </button>

        <div>
          <br />
        </div>

        <button
          className="customButton"
          onClick={() => {
            console.log("to be added");
          }}
        >
          <div className="title-format">Exit</div>
        </button>
      </Column>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </BackgroundDiv>
  );
};


export default HomePage
