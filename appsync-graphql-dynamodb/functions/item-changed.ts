import * as AWS from 'aws-sdk/global'
import {AuthOptions} from 'aws-appsync-auth-link/lib';
import {AWSAppSyncClient, AWSAppSyncClientOptions} from "aws-appsync/lib";
import DynamoDBStreams = require("aws-sdk/clients/dynamodbstreams");
import gql from 'graphql-tag';

(global as any).fetch = require("node-fetch");

export const handler = async (event: any, context: any, callback: any): Promise<any> => {
    const records: DynamoDBStreams.Record[] = event.Records;

    const client = await graphqlClient().hydrated();
    for (const record of records) {
        console.info(`Processing JSON ${JSON.stringify(event)}`);
        console.info(`Context ${JSON.stringify(context)}`);
        console.info('DynamoDB Record: %j', record.dynamodb);

        const mutate = gql(`
          mutation publishChange($itemId: ID!) {
            publishChange(itemId: $itemId) {
                itemId,
                name
            }
          }
        `)

        await client.mutate({
            mutation: mutate,
            variables: {
                itemId: record?.dynamodb?.NewImage?.itemId
            }
        })
    }
    callback(null, "message");

};

function graphqlClient(): AWSAppSyncClient<any> {
    console.info('creating appsync client...');
    return new AWSAppSyncClient({
        url: 'https://3hxvchs2vnduff7p3sq7eqme44.appsync-api.eu-west-1.amazonaws.com/graphql',
        region: process.env.REGION as string,
        auth: {
            type: 'AWS_IAM',
            credentials: AWS.config.credentials,
        } as AuthOptions,
        disableOffline: true
    } as AWSAppSyncClientOptions);
}
