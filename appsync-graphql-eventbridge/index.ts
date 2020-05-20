import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import targets = require("@aws-cdk/aws-events-targets");
import {CfnApiKey, CfnDataSource, CfnGraphQLApi, CfnGraphQLSchema, CfnResolver} from "@aws-cdk/aws-appsync";
import {PolicyStatement, Role, ServicePrincipal} from "@aws-cdk/aws-iam";
import {Rule} from "@aws-cdk/aws-events";
import {Duration, Tag} from '@aws-cdk/core';
import {CfnRegistry, CfnSchema} from '@aws-cdk/aws-eventschemas';
import {AssetCode} from "@aws-cdk/aws-lambda";
import {Topic, CfnSubscription} from "@aws-cdk/aws-sns";
import {CfnTopic} from "@aws-cdk/aws-sns/lib/sns.generated";
import {SqsQueue} from "@aws-cdk/aws-events-targets";
import {Queue} from '@aws-cdk/aws-sqs';

export class AppSyncCdkStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const appSync2EventBridgeGraphQLApi = new CfnGraphQLApi(
            this,
            "AppSync2EventBridgeApi",
            {
                name: "AppSync2EventBridge-API",
                authenticationType: "API_KEY"
            }
        );

        new CfnApiKey(this, "AppSync2EventBridgeApiKey", {
            apiId: appSync2EventBridgeGraphQLApi.attrApiId
        });

        const apiSchema = new CfnGraphQLSchema(this, "EventSchema", {
            apiId: appSync2EventBridgeGraphQLApi.attrApiId,
            definition: `type Event {
        result: String
      }
      
      type Mutation {
        putEvent(event: String!): Event
      }
      
      type Query {
        getEvent: Event
      }
      
      schema {
        query: Query
        mutation: Mutation
      }`
        });

        const appsyncEventBridgeRole = new Role(this, "AppSyncEventBridgeRole", {
            assumedBy: new ServicePrincipal("appsync.amazonaws.com")
        });

        appsyncEventBridgeRole.addToPolicy(
            new PolicyStatement({
                resources: ["*"],
                actions: ["events:Put*"]
            })
        );

        const dataSource = new CfnDataSource(this, "ItemsDataSource", {
            apiId: appSync2EventBridgeGraphQLApi.attrApiId,
            name: "EventBridgeDataSource",
            type: "HTTP",
            httpConfig: {
                authorizationConfig: {
                    authorizationType: "AWS_IAM",
                    awsIamConfig: {
                        signingRegion: this.region,
                        signingServiceName: "events"
                    }
                },
                endpoint: "https://events." + this.region + ".amazonaws.com/"
            },
            serviceRoleArn: appsyncEventBridgeRole.roleArn
        });

        const putEventResolver = new CfnResolver(this, "PutEventMutationResolver", {
            apiId: appSync2EventBridgeGraphQLApi.attrApiId,
            typeName: "Mutation",
            fieldName: "putEvent",
            dataSourceName: dataSource.name,
            requestMappingTemplate: `{
        "version": "2018-05-29",
        "method": "POST",
        "resourcePath": "/",
        "params": {
          "headers": {
            "content-type": "application/x-amz-json-1.1",
            "x-amz-target":"AWSEvents.PutEvents"
          },
          "body": {
            "Entries":[ 
              {
                "Source":"appsync",
                "EventBusName": "default",
                "Detail":"{ \\\"event\\\": \\\"$ctx.arguments.event\\\"}",
                "DetailType":"Event Bridge via GraphQL"
               }
            ]
          }
        }
      }`,
            responseMappingTemplate: `## Raise a GraphQL field error in case of a datasource invocation error
      #if($ctx.error)
        $util.error($ctx.error.message, $ctx.error.type)
      #end
      ## if the response status code is not 200, then return an error. Else return the body **
      #if($ctx.result.statusCode == 200)
          ## If response is 200, return the body.
          {
            "result": "$util.parseJson($ctx.result.body)"
          }
      #else
          ## If response is not 200, append the response to error block.
          $utils.appendError($ctx.result.body, $ctx.result.statusCode)
      #end`
        });
        putEventResolver.addDependsOn(apiSchema);

        const echoLambda = new lambda.Function(this, "echoFunction", {
            code: new AssetCode('functions'),
            handler: "event-receiver.handler",
            runtime: lambda.Runtime.NODEJS_10_X,
            retryAttempts: 5,


        });

        new CfnRegistry(this, "CdkPocRegistry", {
            registryName: "CdkPocRegistry"
        })

        new CfnSchema(this, "PocEventSchema", {
            registryName: "CdkPocRegistry",
            schemaName: "DomainEvent",
            name: "DomainEvent",
            type: "OpenApi3",
            description: "Event emitted on domain events",
            content: `{
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "Event"
  },
  "paths": {},
  "components": {
    "schemas": {
      "Event": {
        "type": "object",
        "required": ["orderId", "eventType", "id"],
        "properties": {
          "eventType": {
            "type": "string"
          },
          "id": {
            "type": "string"
          },
          "orderId": {
            "type": "string"
          }
        }
      }
    }
  }
}`
        } as any);

        const rule = new Rule(this, "AppSyncEventBridgeRle", {
            eventPattern: {
                source: ["appsync"]
            }
        });

        const target = new targets.LambdaFunction(echoLambda);
        rule.addTarget(target);

        const queue = new Queue(this, 'DomainEventQueue', {
            visibilityTimeout: Duration.seconds(30) ,
            receiveMessageWaitTime: Duration.seconds(20)
        })

        const topic  = new CfnTopic(this,'DomainEventTopic', {
            displayName: "DomainEventTopic",
            topicName: "DomainEventTopic"
        })


        const subsription = new CfnSubscription(this, "DomainEventSubscription", {
            topicArn: topic.topicName
        });
        // topic.add(subsription)

    }
}

const app = new cdk.App();
new AppSyncCdkStack(app, "AppSyncEventBridge");
Tag.add(app, "cdk-poc", "cdk-poc");
app.synth();
