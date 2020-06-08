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
        cluster.connections.allowFromAnyIpv4(Port.tcp(80));

        const taskDefinition = new FargateTaskDefinition(this, 'MyTaskDefinition');

        const container = taskDefinition.addContainer('MyContainer', {
            image: ContainerImage.fromRegistry('vad1mo/hello-world-rest'),
        });
        container.addPortMappings({
            containerPort: 5050
        });

        const service = new NetworkLoadBalancedFargateService(this, 'MyFargateServie', {
            cluster,
            taskDefinition,
            publicLoadBalancer: false,
        });

        service.service.connections.allowFromAnyIpv4(Port.tcp(80));

        return service;
    }

    private setupApiGw(service: NetworkLoadBalancedFargateService) {
        const api = new RestApi(this, `MyApi`, {
            restApiName: `MyApi`,
            deployOptions: {
                loggingLevel: MethodLoggingLevel.INFO,
            },
        });
        const resource = api.root.addResource('fargate');
        resource.addMethod("ANY", new HttpIntegration('http://' + service.loadBalancer.loadBalancerDnsName, {
            httpMethod: 'ANY',
            options: {
                connectionType: ConnectionType.VPC_LINK,
                vpcLink: new VpcLink(this, 'MyVpcLink', {
                    targets: [service.loadBalancer],
                    vpcLinkName: 'MyVpcLink',
                })
            },
            proxy: true,
        }))

        // const resource = api.root.addResource('fargate').addResource('{proxy+}');
        // resource.addMethod("ANY", new HttpIntegration('http://' + service.loadBalancer.loadBalancerDnsName + "/{proxy}", {
        //     httpMethod: 'ANY',
        //     options: {
        //         connectionType: ConnectionType.VPC_LINK,
        //         vpcLink: new VpcLink(this, 'MyVpcLink', {
        //             targets: [service.loadBalancer],
        //             vpcLinkName: 'MyVpcLink',
        //         })
        //     },
        //     proxy: true,
        // }))

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
