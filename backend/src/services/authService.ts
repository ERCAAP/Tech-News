import { CognitoIdentityServiceProvider } from 'aws-sdk';

export interface CognitoPayload {
  sub: string;
  email: string;
  'cognito:groups'?: string[];
}

export class AuthService {
  private cognito: CognitoIdentityServiceProvider;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.cognito = new CognitoIdentityServiceProvider();
    this.userPoolId = process.env.COGNITO_USER_POOL_ID!;
    this.clientId = process.env.COGNITO_CLIENT_ID!;
  }

  async verifyToken(token: string): Promise<CognitoPayload | false> {
    try {
      const params = {
        AccessToken: token
      };
      const userData = await this.cognito.getUser(params).promise();
      return {
        email: userData.Username,
        sub: userData.UserAttributes.find(attr => attr.Name === 'sub')?.Value || '',
        'cognito:groups': userData.UserAttributes.find(attr => attr.Name === 'cognito:groups')?.Value?.split(',')
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  async getUserGroups(username?: string): Promise<string[]> {
    if (!username) return [];

    const params = {
      UserPoolId: this.userPoolId,
      Username: username
    };

    try {
      const result = await this.cognito.adminListGroupsForUser(params).promise();
      return result.Groups?.map(group => group.GroupName || '').filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }
} 