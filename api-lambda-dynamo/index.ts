import {IResource, LambdaIntegration, MockIntegration, PassthroughBehavior, RestApi} from '@aws-cdk/aws-apigateway';
import {App, RemovalPolicy, Stack, Tag} from '@aws-cdk/core';
import {AttributeType, Table} from '@aws-cdk/aws-dynamodb';
import {AssetCode, Function, Runtime} from '@aws-cdk/aws-lambda';

export class CdkPocStack extends Stack {
  constructor(app: App, id: string) {
    super(app, id);

    const dynamoTable = this.dynamoDb(id);

    const {getOneLambda, getAllLambda, createOne, updateOne, deleteOne} = this.lambdas(dynamoTable);

    this.apiGateway(id, getAllLambda, createOne, getOneLambda, updateOne, deleteOne);
  }

  private apiGateway(id: string, getAllLambda: Function, createOne: Function, getOneLambda: Function, updateOne: Function, deleteOne: Function) {
    const api = new RestApi(this, `${id}-items-api`, {
      restApiName: `${id}-items`
    });

    const items = api.root.addResource('items');
    const getAllIntegration = new LambdaIntegration(getAllLambda);
    items.addMethod('GET', getAllIntegration);

    const createOneIntegration = new LambdaIntegration(createOne);
    items.addMethod('POST', createOneIntegration);
    this.addCorsOptions(items);

    const singleItem = items.addResource('{id}');
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    singleItem.addMethod('GET', getOneIntegration);

    const updateOneIntegration = new LambdaIntegration(updateOne);
    singleItem.addMethod('PATCH', updateOneIntegration);

    const deleteOneIntegration = new LambdaIntegration(deleteOne);
    singleItem.addMethod('DELETE', deleteOneIntegration);
    this.addCorsOptions(singleItem);
  }

  private dynamoDb(id: string) {
    return new Table(this, `${id}-items`, {
      partitionKey: {
        name: 'itemId',
        type: AttributeType.STRING
      },
      tableName: `${id}-items`,

      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new table, and it will remain in your account until manually deleted. By setting the policy to
      // DESTROY, cdk destroy will delete the table (even if it has data in it)
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    });
  }

  private lambdas(dynamoTable: Table) {
    const getOneLambda = new Function(this, 'getOneItemFunction', {
      code: new AssetCode('src'),
      handler: 'get-one.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      }
    });

    const getAllLambda = new Function(this, 'getAllItemsFunction', {
      code: new AssetCode('src'),
      handler: 'get-all.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      }
    });

    const createOne = new Function(this, 'createItemFunction', {
      code: new AssetCode('src'),
      handler: 'create.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      }
    });

    const updateOne = new Function(this, 'updateItemFunction', {
      code: new AssetCode('src'),
      handler: 'update-one.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      }
    });

    const deleteOne = new Function(this, 'deleteItemFunction', {
      code: new AssetCode('src'),
      handler: 'delete-one.handler',
      runtime: Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        PRIMARY_KEY: 'itemId'
      }
    });

    // SECURITY, ACCESS DYNAMODB <-> LAMBDA
    dynamoTable.grantReadWriteData(getAllLambda);
    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(createOne);
    dynamoTable.grantReadWriteData(updateOne);
    dynamoTable.grantReadWriteData(deleteOne);
    return {getOneLambda, getAllLambda, createOne, updateOne, deleteOne};
  }

  private addCorsOptions(apiResource: IResource) {
    apiResource.addMethod('OPTIONS', new MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Credentials': "'false'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
        },
      }],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}"
      },
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Credentials': true,
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      }]
    })
  }

}


const app = new App();
const dev = new CdkPocStack(app, 'cdk-poc-dev');
Tag.add(dev, "cdk-poc", "cdk-poc");
Tag.add(dev, "cdk-poc-dev", "cdk-poc-dev");
const prod = new CdkPocStack(app, 'cdk-poc-prod');
Tag.add(prod, "cdk-poc", "cdk-poc");
Tag.add(prod, "cdk-poc-prod", "cdk-poc-prod");

app.synth();
