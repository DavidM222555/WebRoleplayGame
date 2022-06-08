import React = require("react");
import { useState } from "react";
import Popup from 'reactjs-popup';
import UserPool from "../UserAuth/UserPool";
import WebsocketAPI from '../API';
import { CognitoUser, AuthenticationDetails, CognitoUserSession } from "amazon-cognito-identity-js";




import './LoginPageStyles.css';



export const LoginPage = (props: { API: WebsocketAPI }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent<any>, close: any) => {
    e.preventDefault();

    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (result: CognitoUserSession) => {
        console.log(result);
        close();
        props.API.logIn(result, () => { });
        //this should be callback window.location.reload
      },
      onFailure: (err: any) => {
        console.log(err);
      },
      newPasswordRequired: (userAttributes: any, requiredAttributes: any) => {
        console.log("newPasswordRequired");
        console.log(userAttributes, requiredAttributes);
      }
    });
  }




  return (
    <Popup trigger={<div>Login</div>} modal>
      {(close: any) => (
        <form onSubmit={(e) => { onSubmit(e, close) }}>
          <div>
            <label>
              Username:
              <input type="text" name="name" onChange={event => { setEmail(event.target.value) }} />
            </label>
          </div>
          <div>
            <label>
              Password:
              <input type="password" name="password" onChange={event => { setPassword(event.target.value) }} />
            </label>
          </div>

          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
      )}

    </Popup>



  )
};

export default LoginPage;
