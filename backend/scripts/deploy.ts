import { CloudFormation } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

const cloudFormation = new CloudFormation({
  region: process.env.AWS_REGION
});

async function deploy() {
  const templatePath = path.join(__dirname, '../infrastructure/template.yaml');
  const template = fs.readFileSync(templatePath, 'utf8');

  const stackName = `tech-news-${process.env.NODE_ENV || 'development'}`;

  const params = {
    StackName: stackName,
    TemplateBody: template,
    Capabilities: ['CAPABILITY_IAM'],
    Parameters: [
      {
        ParameterKey: 'Environment',
        ParameterValue: process.env.NODE_ENV || 'development'
      }
    ]
  };

  try {
    console.log(`Deploying infrastructure to ${process.env.NODE_ENV || 'development'}...`);
    
    // Check if stack exists
    try {
      await cloudFormation.describeStacks({ StackName: stackName }).promise();
      console.log('Updating existing stack...');
      await cloudFormation.updateStack(params).promise();
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Creating new stack...');
        await cloudFormation.createStack(params).promise();
      } else {
        throw error;
      }
    }

    console.log('Waiting for deployment to complete...');
    await cloudFormation.waitFor('stackCreateComplete', { StackName: stackName }).promise();
    console.log('Deployment completed successfully!');

    // Get stack outputs
    const { Stacks } = await cloudFormation.describeStacks({ StackName: stackName }).promise();
    const outputs = Stacks?.[0].Outputs;
    
    if (outputs) {
      console.log('\nStack Outputs:');
      outputs.forEach(output => {
        console.log(`${output.OutputKey}: ${output.OutputValue}`);
      });
    }

  } catch (error) {
    if (error.message.includes('No updates are to be performed')) {
      console.log('No updates needed, stack is up to date.');
    } else {
      console.error('Deployment error:', error);
      process.exit(1);
    }
  }
}

deploy(); 