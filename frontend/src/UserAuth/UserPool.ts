import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId:'us-east-2_PQOLoX20v',
    ClientId: '3u80ae0fksl4lt569iefu34m06'
}

export default new CognitoUserPool(poolData);
