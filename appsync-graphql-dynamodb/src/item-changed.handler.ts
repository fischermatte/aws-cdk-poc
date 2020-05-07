import DynamoDBStreams = require("aws-sdk/clients/dynamodbstreams");
import {AWSAppSyncClient} from "aws-appsync";

export const handler = async (event: any, context:any, callback:any) : Promise <any> => {
    console.log(JSON.stringify(event, null, 2));
    const records:DynamoDBStreams.Record[] = event.Records;
    records.forEach(function(record) {
        console.log(JSON.stringify(event));
        console.log(JSON.stringify(context));
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
    });
    callback(null, "message");

};

function api(): AWSAppSyncClient {
    return new AWSAppSyncClient({
        url: 'https://j7ein4xdrfdfbgvoraub6n5cji.appsync-api.eu-west-1.amazonaws.com/graphql',
        region: process.env.REGION as string,
        auth: {
            type: 'AWS_IAM',
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        },
        disableOffline: true
    });
}
