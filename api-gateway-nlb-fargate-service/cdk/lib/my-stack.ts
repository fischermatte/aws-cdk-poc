import {Construct, Stack, StackProps} from '@aws-cdk/core';
import {
    ConnectionType,
    HttpIntegration,
    IResource,
    MethodLoggingLevel,
    MockIntegration,
    PassthroughBehavior,
    RestApi,
    VpcLink
} from "@aws-cdk/aws-apigateway";
import {NetworkLoadBalancedFargateService} from "@aws-cdk/aws-ecs-patterns";
import {AwsLogDriver, Cluster, ContainerImage, FargateTaskDefinition} from "@aws-cdk/aws-ecs";
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

        const taskDefinition = new FargateTaskDefinition(this, 'MyTaskDefinition');

        const container = taskDefinition.addContainer('MyContainer', {
            image: ContainerImage.fromRegistry('vad1mo/hello-world-rest'),
            logging: new AwsLogDriver({
                streamPrefix: 'MyContainer'
            })

        });
        container.addPortMappings({
            containerPort: 5050,
            hostPort: 5050
        });

        const service = new NetworkLoadBalancedFargateService(this, 'MyFargateService', {
            cluster,
            taskDefinition,
            publicLoadBalancer: false,
        });

        service.service.connections.allowFromAnyIpv4(Port.allTraffic());

        return service;
    }

    private setupApiGw(service: NetworkLoadBalancedFargateService) {
        const api = new RestApi(this, `MyApi`, {
            restApiName: `MyApi`,
            deployOptions: {
                loggingLevel: MethodLoggingLevel.INFO,
            },
        });
        const resource = api.root.addResource('server').addResource('graphql');
        resource.addMethod("ANY", new HttpIntegration(
            'http://' + service.loadBalancer.loadBalancerDnsName + '/graphql',
            {
            httpMethod: 'ANY',
            options: {
                connectionType: ConnectionType.VPC_LINK,
                vpcLink: new VpcLink(this, 'MyVpcLink', {
                    targets: [service.loadBalancer],
                    vpcLinkName: 'MyVpcLink',
                })
            },
        }))
        this.addCorsOptions(resource);

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
