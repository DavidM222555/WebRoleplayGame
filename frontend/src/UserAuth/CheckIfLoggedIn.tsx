import React = require("react");
import { useContext, useEffect } from 'react';
import { AccountContext } from './AccountWrapper';
// import { CognitoUserSession} from 'amazon-cognito-identity-js'



export default (props: any) => {
    const { getSession, loggedIn, setLoggedIn } = useContext(AccountContext);

    useEffect(() => {
        getSession().then(() => {setLoggedIn(true) }, [loggedIn]);
    })



    return (
        <>
            {loggedIn ? 
            <>
                {props.showIfLoggedIn}
            </> : 
            <>
                {props.showIfNotLoggedIn}
            </>
            }
        </>
    )

}