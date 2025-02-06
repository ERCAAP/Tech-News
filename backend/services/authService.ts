import { CognitoIdentityServiceProvider } from 'aws-sdk';

export class AuthService {
  private cognito: CognitoIdentityServiceProvider;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.cognito = new CognitoIdentityServiceProvider();
    this.userPoolId = process.env.COGNITO_USER_POOL_ID!;
    this.clientId = process.env.COGNITO_CLIENT_ID!;
  }

  async signUp(email: string, password: string, attributes: Record<string, string>) {
    const params = {
      UserPoolId: this.userPoolId,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({
        Name,
        Value
      }))
    };

    try {
      await this.cognito.adminCreateUser(params).promise();
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    const params = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: this.userPoolId,
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };

    try {
      const result = await this.cognito.adminInitiateAuth(params).promise();
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const params = {
        AccessToken: token
      };
      const userData = await this.cognito.getUser(params).promise();
      return {
        email: userData.Username,
        sub: userData.UserAttributes.find(attr => attr.Name === 'sub')?.Value
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  async addUserToGroup(username: string, groupName: string) {
    const params = {
      GroupName: groupName,
      UserPoolId: this.userPoolId,
      Username: username
    };

    try {
      await this.cognito.adminAddUserToGroup(params).promise();
      return true;
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw error;
    }
  }

  async getUserGroups(username?: string) {
    if (!username) return [];

    const params = {
      UserPoolId: this.userPoolId,
      Username: username
    };

    try {
      const result = await this.cognito.adminListGroupsForUser(params).promise();
      return result.Groups?.map(group => group.GroupName) || [];
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }
} 