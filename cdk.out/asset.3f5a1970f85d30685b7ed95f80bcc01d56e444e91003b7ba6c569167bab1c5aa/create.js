"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const db = new aws_sdk_1.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`, DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;
exports.handler = async (event = {}) => {
    console.info('yearh i am called...');
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    item[PRIMARY_KEY] = uuidv4();
    const params = {
        TableName: TABLE_NAME,
        Item: item
    };
    try {
        await db.put(params).promise();
        return { statusCode: 201, body: '' };
    }
    catch (dbError) {
        console.error(`failed to save item ${JSON.stringify(params)}`);
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQW1DO0FBR25DLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztBQUNoRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7QUFFbEQsTUFBTSxFQUFFLEdBQUcsSUFBSSxrQkFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVsQyxNQUFNLGlCQUFpQixHQUFHLHlEQUF5RCxFQUNqRix3QkFBd0IsR0FBRywrRkFBK0YsQ0FBQztBQUVoSCxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsUUFBYSxFQUFFLEVBQWtCLEVBQUU7SUFDL0QsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQ2YsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLHFEQUFxRCxFQUFFLENBQUM7S0FDekY7SUFDRCxNQUFNLElBQUksR0FBRyxPQUFPLEtBQUssQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDN0IsTUFBTSxNQUFNLEdBQStCO1FBQ3pDLFNBQVMsRUFBRSxVQUFVO1FBQ3JCLElBQUksRUFBRSxJQUFJO0tBQ1gsQ0FBQztJQUVGLElBQUk7UUFDRixNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO0tBQ3RDO0lBQUMsT0FBTyxPQUFPLEVBQUU7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDOUQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLElBQUksS0FBSyxxQkFBcUIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDOUcsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQztLQUNqRDtBQUNILENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IER5bmFtb0RCIH0gZnJvbSAnYXdzLXNkayc7XHJcbmltcG9ydCB7RG9jdW1lbnRDbGllbnR9IGZyb20gXCJhd3Mtc2RrL2xpYi9keW5hbW9kYi9kb2N1bWVudF9jbGllbnRcIjtcclxuXHJcbmNvbnN0IFRBQkxFX05BTUUgPSBwcm9jZXNzLmVudi5UQUJMRV9OQU1FIHx8ICcnO1xyXG5jb25zdCBQUklNQVJZX0tFWSA9IHByb2Nlc3MuZW52LlBSSU1BUllfS0VZIHx8ICcnO1xyXG5cclxuY29uc3QgZGIgPSBuZXcgRHluYW1vREIuRG9jdW1lbnRDbGllbnQoKTtcclxuY29uc3QgdXVpZHY0ID0gcmVxdWlyZSgndXVpZC92NCcpO1xyXG5cclxuY29uc3QgUkVTRVJWRURfUkVTUE9OU0UgPSBgRXJyb3I6IFlvdSdyZSB1c2luZyBBV1MgcmVzZXJ2ZWQga2V5d29yZHMgYXMgYXR0cmlidXRlc2AsXHJcbiAgRFlOQU1PREJfRVhFQ1VUSU9OX0VSUk9SID0gYEVycm9yOiBFeGVjdXRpb24gdXBkYXRlLCBjYXVzZWQgYSBEeW5hbW9kYiBlcnJvciwgcGxlYXNlIHRha2UgYSBsb29rIGF0IHlvdXIgQ2xvdWRXYXRjaCBMb2dzLmA7XHJcblxyXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogYW55ID0ge30pIDogUHJvbWlzZSA8YW55PiA9PiB7XHJcbiAgY29uc29sZS5pbmZvKCd5ZWFyaCBpIGFtIGNhbGxlZC4uLicpO1xyXG4gIGlmICghZXZlbnQuYm9keSkge1xyXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZTogNDAwLCBib2R5OiAnaW52YWxpZCByZXF1ZXN0LCB5b3UgYXJlIG1pc3NpbmcgdGhlIHBhcmFtZXRlciBib2R5JyB9O1xyXG4gIH1cclxuICBjb25zdCBpdGVtID0gdHlwZW9mIGV2ZW50LmJvZHkgPT0gJ29iamVjdCcgPyBldmVudC5ib2R5IDogSlNPTi5wYXJzZShldmVudC5ib2R5KTtcclxuICBpdGVtW1BSSU1BUllfS0VZXSA9IHV1aWR2NCgpO1xyXG4gIGNvbnN0IHBhcmFtczpEb2N1bWVudENsaWVudC5QdXRJdGVtSW5wdXQgPSB7XHJcbiAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXHJcbiAgICBJdGVtOiBpdGVtXHJcbiAgfTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGRiLnB1dChwYXJhbXMpLnByb21pc2UoKTtcclxuICAgIHJldHVybiB7IHN0YXR1c0NvZGU6IDIwMSwgYm9keTogJycgfTtcclxuICB9IGNhdGNoIChkYkVycm9yKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKGBmYWlsZWQgdG8gc2F2ZSBpdGVtICR7SlNPTi5zdHJpbmdpZnkocGFyYW1zKX1gKVxyXG4gICAgY29uc3QgZXJyb3JSZXNwb25zZSA9IGRiRXJyb3IuY29kZSA9PT0gJ1ZhbGlkYXRpb25FeGNlcHRpb24nICYmIGRiRXJyb3IubWVzc2FnZS5pbmNsdWRlcygncmVzZXJ2ZWQga2V5d29yZCcpID9cclxuICAgIERZTkFNT0RCX0VYRUNVVElPTl9FUlJPUiA6IFJFU0VSVkVEX1JFU1BPTlNFO1xyXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZTogNTAwLCBib2R5OiBlcnJvclJlc3BvbnNlIH07XHJcbiAgfVxyXG59O1xyXG4iXX0=