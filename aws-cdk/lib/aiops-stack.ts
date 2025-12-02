import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import path = require("path");
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AIOpsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiHandler = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "ApiHandlerFunction",
      {
        handler: "handler",
        entry: path.join(__dirname, "./apiHandler.ts"),
        timeout: cdk.Duration.seconds(10),
      }
    );

    const api = new cdk.aws_apigateway.LambdaRestApi(this, "ApiGateway", {
      handler: apiHandler,
    });

    // output the API endpoint
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url ?? "No endpoint",
    });
  }
}
