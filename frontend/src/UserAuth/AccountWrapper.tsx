import React = require("react");
import { createContext, useState } from 'react';
import { CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import UserPool from './UserPool';


// interface AccountContextInterface {
//     loggedIn: boolean | null| {(reason: any): PromiseLike<never>},
//     setLoggedIn: React.Dispatch<React.SetStateAction<boolean>> | null,
//     getSession: {():Promise<CognitoUserSession>} | null ,
//     authenticate: (email: string, Password: string) => Promise<unknown>,
//     logout: () => Promise<void>
// };

// const defaultContext : AccountContextInterface = {
//     loggedIn: null,
//     setLoggedIn: null,
//     getSession: null
// };

const AccountContext = createContext<any>(null);


const Account = (props: any) =>{
    const [loggedIn, setLoggedIn] = useState(false);


    //this code checks if you are already logged in, if you are you do not have to login, callback only called if logged in
    const getSession:()=>Promise<CognitoUserSession> = async () =>  {
        console.log("running getSession")
        return new Promise((resolve, reject) => {
            const user = UserPool.getCurrentUser();
            if (user) {
                user.getSession(async (err: Error | null, session: CognitoUserSession ) => {
                    if (err) reject();
                    //code here to set amazon ID to state, not sure what it's called 

                    //
                    // TO DO
                    //
                    //
                    //
                    //
                    //
                    //
                    //
                    //
                    //
                    //
                    //




                    resolve(session);
                })
            }
            else reject();
        })
    }

    const authenticate = async (email: string, Password: string) => {

        return new Promise((resolve, reject) => {
            const user = new CognitoUser({ Username: email, Pool: UserPool })
            const authDetails = new AuthenticationDetails({ Username: email, Password })

            user.authenticateUser(authDetails, {
                onSuccess: (data: any) => { //need to figure out what type data is
                    // console.log('onSuccess:', data);
                    resolve(data);
                },

                onFailure: (err: any) => { //need to figure out what type err is
                    // console.error('onFailure:', err);
                    reject(err);
                },

                newPasswordRequired: (data: any) => { //need to figure out what type data is
                    // console.log('newPasswordRequired:', data);
                    // shouldn't be used here but just in case
                    resolve(data);
                }
            });
        });
    }

    const logout = async () => {
        const user = UserPool.getCurrentUser();
        if (user) {
            user.signOut();
            setLoggedIn(false);
        }
    }
    
    return (
        <AccountContext.Provider value={{ authenticate, logout, getSession, loggedIn, setLoggedIn}}>

            {props.children}
        </AccountContext.Provider>
    );
}

export {Account, AccountContext}