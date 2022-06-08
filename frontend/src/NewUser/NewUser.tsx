import React = require("react");
import { useState } from "react";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import UserPool from "../UserAuth/UserPool";

export const NewUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent<any>) => {
    e.preventDefault();
    UserPool.signUp(email, password, [], [], (err: Error | undefined, data: any) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
        alert("New Account Created");
      }
    });
  }




  return (
    <Popup trigger={<div>Sign Up</div>} modal>

      <form onSubmit={onSubmit}>
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
    </Popup>
  )
};


export default NewUser;
