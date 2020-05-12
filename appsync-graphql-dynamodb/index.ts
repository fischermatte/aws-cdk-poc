import cdk = require('@aws-cdk/core');
import {CfnApiKey, CfnDataSource, CfnGraphQLApi, CfnGraphQLSchema, CfnResolver} from '@aws-cdk/aws-appsync';
import {AttributeType, BillingMode, ProjectionType, StreamViewType, Table} from '@aws-cdk/aws-dynamodb';
import {ManagedPolicy, Role, ServicePrincipal} from '@aws-cdk/aws-iam';
import {Tag} from "@aws-cdk/core";
import {readFileSync} from 'fs';
import {AssetCode, Function, Runtime, StartingPosition} from '@aws-cdk/aws-lambda';
import {DynamoEventSource} from '@aws-cdk/aws-lambda-event-sources';
import {DynamoEventSourceProps} from "@aws-cdk/aws-lambda-event-sources/lib/dynamodb";

const schemaDefinition = readFileSync('./items.graphql', 'utf-8');


export class AppSyncCdkStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const itemsGraphQLApi = new CfnGraphQLApi(this, 'ItemsApi', {
      name: 'items-api',
      authenticationType: 'API_KEY'
    });

    new CfnApiKey(this, 'ItemsApiKey', {
      apiId: itemsGraphQLApi.attrApiId
    });

    const apiSchema = new CfnGraphQLSchema(this, 'ItemsSchema', {
      apiId: itemsGraphQLApi.attrApiId,
      definition: schemaDefinition
    });

    const itemsTable = new Table(this, 'ItemsTable', {
      tableName: `${id}-items`,
      partitionKey: {
        name: `itemId`,
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'name',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_IMAGE,

      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new table, and it will remain in your account until manually deleted. By setting the policy to 
      // DESTROY, cdk destroy will delete the table (even if it has data in it)
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
    });

    itemsTable.addLocalSecondaryIndex({
      projectionType:ProjectionType.ALL,
      indexName: 'price-local-index',
      sortKey: {
        name: 'price',
        type: AttributeType.NUMBER
      }
    })

    // itemsTable.addLocalSecondaryIndex({
    //   projectionType:ProjectionType.ALL,
    //   indexName: 'description-local-index',
    //   sortKey: {
    //     name: 'description',
    //     type: AttributeType.STRING
    //   }
    // })

    // itemsTable.addGlobalSecondaryIndex({
    //   indexName: 'name-global-index',
    //   partitionKey: {
    //     type: AttributeType.STRING,
    //     name: 'name'
    //   },
    //   projectionType: ProjectionType.ALL,
    //   sortKey: {
    //     type: AttributeType.STRING,
    //     name: 'name'
    //   }
    //
    // })

    const itemsTableRole = new Role(this, 'ItemsDynamoDBRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com')
    });

    itemsTableRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));

    const itemChangedFunction = new Function(this, 'itemChangedFunction', {
      code: new AssetCode('src'),
      handler: 'item-changed.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        REGION: this.region,
        TABLE_NAME: itemsTable.tableName,
        PRIMARY_KEY: 'itemId'
      }
    });

    itemChangedFunction.addEventSource(new DynamoEventSource(itemsTable, {
      startingPosition: StartingPosition.TRIM_HORIZON,
      batchSize: 1,
      bisectBatchOnError: true,
      retryAttempts: 10
    } as DynamoEventSourceProps))

    itemsTable.grantReadWriteData(itemChangedFunction);

    const dataSource = new CfnDataSource(this, 'ItemsDataSource', {
      apiId: itemsGraphQLApi.attrApiId,
      name: 'ItemsDynamoDataSource',
      type: 'AMAZON_DYNAMODB',
      dynamoDbConfig: {
        tableName: itemsTable.tableName,
        awsRegion: this.region
      },
      serviceRoleArn: itemsTableRole.roleArn
    });

    const getOneResolver = new CfnResolver(this, 'GetOneQueryResolver', {
      apiId: itemsGraphQLApi.attrApiId,
      typeName: 'Query',
      fieldName: 'getOne',
      dataSourceName: dataSource.name,
      requestMappingTemplate: `{
        "version": "2017-02-28",
        "operation": "GetItem",
        "key": {
          "itemId": $util.dynamodb.toDynamoDBJson($ctx.args.itemId)
        }
      }`,
      responseMappingTemplate: `$util.toJson($ctx.result)`
    });
    getOneResolver.addDependsOn(apiSchema);

    const getAllResolver = new CfnResolver(this, 'GetAllQueryResolver', {
      apiId: itemsGraphQLApi.attrApiId,
      typeName: 'Query',
      fieldName: 'all',
      dataSourceName: dataSource.name,
      requestMappingTemplate: `{
        "version": "2017-02-28",
        "operation": "Scan",
        "limit": $util.defaultIfNull($ctx.args.limit, 20),
        "nextToken": $util.toJson($util.defaultIfNullOrEmpty($ctx.args.nextToken, null))
      }`,
      responseMappingTemplate: `$util.toJson($ctx.result)`
    });
    getAllResolver.addDependsOn(apiSchema);

    const saveResolver = new CfnResolver(this, 'SaveMutationResolver', {
      apiId: itemsGraphQLApi.attrApiId,
      typeName: 'Mutation',
      fieldName: 'save',
      dataSourceName: dataSource.name,
      requestMappingTemplate: `{
        "version": "2017-02-28",
        "operation": "PutItem",
        "key": {
          "itemId": { "S": "$ctx.args.item.itemId" }
        },
        "attributeValues": $util.dynamodb.toMapValuesJson($ctx.args.item)
      }`,
      responseMappingTemplate: `$util.toJson($ctx.result)`
    });
    saveResolver.addDependsOn(apiSchema);

    const deleteResolver = new CfnResolver(this, 'DeleteMutationResolver', {
      apiId: itemsGraphQLApi.attrApiId,
      typeName: 'Mutation',
      fieldName: 'delete',
      dataSourceName: dataSource.name,
      requestMappingTemplate: `{
        "version": "2017-02-28",
        "operation": "DeleteItem",
        "key": {
          "itemId": $util.dynamodb.toDynamoDBJson($ctx.args.itemId)
        }
      }`,
      responseMappingTemplate: `$util.toJson($ctx.result)`
    });
    deleteResolver.addDependsOn(apiSchema);

    // const publishChangeResolver = new CfnResolver(this, 'PublishChangeMutationResolver', {
    //   apiId: itemsGraphQLApi.attrApiId,
    //   typeName: 'Mutation',
    //   fieldName: 'publishChange',
    //   dataSourceName: dataSource.name,
    //   requestMappingTemplate: `{
    //     "version": "2017-02-28",
    //     "operation": "PutItem",
    //     "key": {
    //       "${tableName}Id": { "S": "$util.autoId()" }
    //     },
    //     "attributeValues": {
    //       "name": $util.dynamodb.toDynamoDBJson($ctx.args.name)
    //     }
    //   }`,
    //   responseMappingTemplate: `$util.toJson($ctx.result)`
    // });
    // publishChangeResolver.addDependsOn(apiSchema);

  }
}

const app = new cdk.App();
new AppSyncCdkStack(app, 'cdk-poc-appsync');
Tag.add(app, "cdk-poc", "cdk-poc");
app.synth();
