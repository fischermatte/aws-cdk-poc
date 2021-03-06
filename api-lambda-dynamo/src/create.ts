import {DynamoDB} from "aws-sdk";
import {v4} from "uuid";

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new DynamoDB.DocumentClient();

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}) : Promise <any> => {
  console.info('yearh i am called...');
  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  item[PRIMARY_KEY] = v4();
  const params:DynamoDB.DocumentClient.PutItemInput = {
    TableName: TABLE_NAME,
    Item: item
  };

  try {
    await db.put(params).promise();
    return { statusCode: 201, body: JSON.stringify({ })};
  } catch (dbError) {
    console.error(`failed to save item ${JSON.stringify(params)}`)
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
    DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: {error: JSON.stringify(errorResponse)} };
  }
};
