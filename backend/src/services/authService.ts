import { 
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminInitiateAuthCommand,
  GetUserCommand,
  AdminAddUserToGroupCommand,
  AdminListGroupsForUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AttributeType
} from '@aws-sdk/client-cognito-identity-provider';

export class AuthService {
  private cognito: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.cognito = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION
    });
    this.userPoolId = process.env.COGNITO_USER_POOL_ID!;
    this.clientId = process.env.COGNITO_CLIENT_ID!;
  }

  async signUp(email: string, password: string, attributes: Record<string, string>) {
    const userAttributes: AttributeType[] = Object.entries(attributes).map(([Name, Value]) => ({
      Name,
      Value
    }));

    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: this.userPoolId,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: userAttributes
    });

    try {
      await this.cognito.send(createUserCommand);

      // Set permanent password
      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        Password: password,
        Permanent: true
      });
      await this.cognito.send(setPasswordCommand);

      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    const authCommand = new AdminInitiateAuthCommand({
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      UserPoolId: this.userPoolId,
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    });

    try {
      const result = await this.cognito.send(authCommand);
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async verifyToken(token: string) {
    try {
      const getUserCommand = new GetUserCommand({
        AccessToken: token
      });
      const userData = await this.cognito.send(getUserCommand);
      
      return {
        email: userData.Username,
        sub: userData.UserAttributes?.find(attr => attr.Name === 'sub')?.Value
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }

  async addUserToGroup(username: string, groupName: string) {
    const addToGroupCommand = new AdminAddUserToGroupCommand({
      GroupName: groupName,
      UserPoolId: this.userPoolId,
      Username: username
    });

    try {
      await this.cognito.send(addToGroupCommand);
      return true;
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw error;
    }
  }

  async getUserGroups(username?: string) {
    if (!username) return [];

    const listGroupsCommand = new AdminListGroupsForUserCommand({
      UserPoolId: this.userPoolId,
      Username: username
    });

    try {
      const result = await this.cognito.send(listGroupsCommand);
      return result.Groups?.map(group => group.GroupName).filter(Boolean) || [];
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  async updateUserAttributes(username: string, attributes: Record<string, string>) {
    const userAttributes: AttributeType[] = Object.entries(attributes).map(([Name, Value]) => ({
      Name,
      Value
    }));

    const updateCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.userPoolId,
      Username: username,
      UserAttributes: userAttributes
    });

    try {
      await this.cognito.send(updateCommand);
      return true;
    } catch (error) {
      console.error('Error updating user attributes:', error);
      throw error;
    }
  }

  async getUser(username: string) {
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: this.userPoolId,
      Username: username
    });

    try {
      const userData = await this.cognito.send(getUserCommand);
      return {
        username: userData.Username,
        attributes: userData.UserAttributes?.reduce((acc, attr) => {
          if (attr.Name && attr.Value) {
            acc[attr.Name] = attr.Value;
          }
          return acc;
        }, {} as Record<string, string>)
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
} 