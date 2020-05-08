//
// declare module '@redux-offline/redux-offline/lib/types' {
//     export type NetInfo = any;
//     export type NetworkCallback = any;
// }

import * as AWS from 'aws-sdk/global'
import {AWSAppSyncClient} from "aws-appsync/lib";
import {AuthOptions} from 'aws-appsync-auth-link';
import {AWSAppSyncClientOptions} from "aws-appsync/lib/client";
import gql from 'graphql-tag';
import DynamoDBStreams = require("aws-sdk/clients/dynamodbstreams");

export const handler = async (event: any, context: any, callback: any): Promise<any> => {
    console.log(JSON.stringify(event, null, 2));
    const records: DynamoDBStreams.Record[] = event.Records;

    const client = await graphqlClient().hydrated();
    for (const record of records) {
        console.log(JSON.stringify(event));
        console.log(JSON.stringify(context));
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);

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
    return new AWSAppSyncClient({
        url: 'https://j7ein4xdrfdfbgvoraub6n5cji.appsync-api.eu-west-1.amazonaws.com/graphql',
        region: process.env.REGION as string,
        auth: {
            type: 'AWS_IAM',
            credentials: AWS.config.credentials,
        } as AuthOptions,
        disableOffline: true
    } as AWSAppSyncClientOptions);
}
