
import {Construct, Stack, StackProps} from '@aws-cdk/core';
import {
  AuthorizationType,
  ConnectionType,
  HttpIntegration,
  IResource,
  MethodLoggingLevel, MockIntegration, PassthroughBehavior,
  RestApi, VpcLink
} from "@aws-cdk/aws-apigateway";
import {NetworkLoadBalancedFargateService} from "@aws-cdk/aws-ecs-patterns";
import {Cluster, ContainerImage, FargateTaskDefinition} from "@aws-cdk/aws-ecs";
import {Port, Vpc} from "@aws-cdk/aws-ec2";

export class MyStack extends Stack {
  constructor(scope: Construct, config?: StackProps) {
    super(scope, 'MyStack', config);
    const service = this.setupService();
    this.setupApiGw(service);
  }

  private setupService(): NetworkLoadBalancedFargateService {
    const vpc = new Vpc(this, 'MyVpc');

    const cluster = new Cluster(this, 'MyCluster', {
      vpc: vpc,
    });
    cluster.connections.allowFromAnyIpv4(Port.tcp(8080));

    const taskDefinition = new FargateTaskDefinition(this, 'MyTaskDefinition');

    const container = taskDefinition.addContainer('MyContainer', {
      image: ContainerImage.fromRegistry('kornkitti/express-hello-world'),
    });
    container.addPortMappings({
      containerPort: 8080,
      hostPort: 8080,
    });

    const service = new NetworkLoadBalancedFargateService(this, 'MyFargateServie', {
      cluster,
      taskDefinition,
      assignPublicIp: true,
    });

    service.service.connections.allowFromAnyIpv4(Port.tcp(8080));

    return service;
  }

  private setupApiGw(service: NetworkLoadBalancedFargateService) {
    // vpc link in order to allow access to NLB
    const vpcLink = new VpcLink(this, 'MyVpcLink', {
      targets: [service.loadBalancer],
      vpcLinkName: 'MyVpcLink',
    });

    const api = new RestApi(this, `MyApi`, {
      restApiName: `MyApi`,
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
      },
    });
    api.root.addProxy({
      anyMethod: true,
      defaultIntegration: new HttpIntegration('http://localhost.com:8080', {
        httpMethod: 'ANY',
        options: {
          connectionType: ConnectionType.VPC_LINK,
          vpcLink: vpcLink,
        },
        proxy: true,
      }),
      defaultMethodOptions: {
        authorizationType: AuthorizationType.NONE,
      },
    });

    this.addCorsOptions(api.root);
  }

  private addCorsOptions(apiResource: IResource) {
    apiResource.addMethod(
        'OPTIONS',
        new MockIntegration({
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Headers':
                    "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
                'method.response.header.Access-Control-Allow-Credentials': "'false'",
                'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
              },
            },
          ],
          passthroughBehavior: PassthroughBehavior.NEVER,
          requestTemplates: {
            'application/json': '{"statusCode": 200}',
          },
        }),
        {
          methodResponses: [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': true,
                'method.response.header.Access-Control-Allow-Methods': true,
                'method.response.header.Access-Control-Allow-Credentials': true,
                'method.response.header.Access-Control-Allow-Origin': true,
              },
            },
          ],
        }
    );
  }
}
