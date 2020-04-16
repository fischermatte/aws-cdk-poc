"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const uuidv4 = require('uuid/v4');
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`, DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;
exports.handler = async (event = {}) => {
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
        const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
            DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
        return { statusCode: 500, body: errorResponse };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM3QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO0FBQ2hELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQztBQUVsRCxNQUFNLGlCQUFpQixHQUFHLHlEQUF5RCxFQUNqRix3QkFBd0IsR0FBRywrRkFBK0YsQ0FBQztBQUVoSCxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsUUFBYSxFQUFFLEVBQWtCLEVBQUU7SUFFL0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFDZixPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUscURBQXFELEVBQUUsQ0FBQztLQUN6RjtJQUNELE1BQU0sSUFBSSxHQUFHLE9BQU8sS0FBSyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pGLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQztJQUM3QixNQUFNLE1BQU0sR0FBRztRQUNiLFNBQVMsRUFBRSxVQUFVO1FBQ3JCLElBQUksRUFBRSxJQUFJO0tBQ1gsQ0FBQztJQUVGLElBQUk7UUFDRixNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO0tBQ3RDO0lBQUMsT0FBTyxPQUFPLEVBQUU7UUFDaEIsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLElBQUksS0FBSyxxQkFBcUIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDOUcsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQztLQUNqRDtBQUNILENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IEFXUyA9IHJlcXVpcmUoJ2F3cy1zZGsnKTtcclxuY29uc3QgZGIgPSBuZXcgQVdTLkR5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XHJcbmNvbnN0IHV1aWR2NCA9IHJlcXVpcmUoJ3V1aWQvdjQnKTtcclxuY29uc3QgVEFCTEVfTkFNRSA9IHByb2Nlc3MuZW52LlRBQkxFX05BTUUgfHwgJyc7XHJcbmNvbnN0IFBSSU1BUllfS0VZID0gcHJvY2Vzcy5lbnYuUFJJTUFSWV9LRVkgfHwgJyc7XHJcblxyXG5jb25zdCBSRVNFUlZFRF9SRVNQT05TRSA9IGBFcnJvcjogWW91J3JlIHVzaW5nIEFXUyByZXNlcnZlZCBrZXl3b3JkcyBhcyBhdHRyaWJ1dGVzYCxcclxuICBEWU5BTU9EQl9FWEVDVVRJT05fRVJST1IgPSBgRXJyb3I6IEV4ZWN1dGlvbiB1cGRhdGUsIGNhdXNlZCBhIER5bmFtb2RiIGVycm9yLCBwbGVhc2UgdGFrZSBhIGxvb2sgYXQgeW91ciBDbG91ZFdhdGNoIExvZ3MuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnkgPSB7fSkgOiBQcm9taXNlIDxhbnk+ID0+IHtcclxuXHJcbiAgaWYgKCFldmVudC5ib2R5KSB7XHJcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlOiA0MDAsIGJvZHk6ICdpbnZhbGlkIHJlcXVlc3QsIHlvdSBhcmUgbWlzc2luZyB0aGUgcGFyYW1ldGVyIGJvZHknIH07XHJcbiAgfVxyXG4gIGNvbnN0IGl0ZW0gPSB0eXBlb2YgZXZlbnQuYm9keSA9PSAnb2JqZWN0JyA/IGV2ZW50LmJvZHkgOiBKU09OLnBhcnNlKGV2ZW50LmJvZHkpO1xyXG4gIGl0ZW1bUFJJTUFSWV9LRVldID0gdXVpZHY0KCk7XHJcbiAgY29uc3QgcGFyYW1zID0ge1xyXG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FLFxyXG4gICAgSXRlbTogaXRlbVxyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBkYi5wdXQocGFyYW1zKS5wcm9taXNlKCk7XHJcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlOiAyMDEsIGJvZHk6ICcnIH07XHJcbiAgfSBjYXRjaCAoZGJFcnJvcikge1xyXG4gICAgY29uc3QgZXJyb3JSZXNwb25zZSA9IGRiRXJyb3IuY29kZSA9PT0gJ1ZhbGlkYXRpb25FeGNlcHRpb24nICYmIGRiRXJyb3IubWVzc2FnZS5pbmNsdWRlcygncmVzZXJ2ZWQga2V5d29yZCcpID9cclxuICAgIERZTkFNT0RCX0VYRUNVVElPTl9FUlJPUiA6IFJFU0VSVkVEX1JFU1BPTlNFO1xyXG4gICAgcmV0dXJuIHsgc3RhdHVzQ29kZTogNTAwLCBib2R5OiBlcnJvclJlc3BvbnNlIH07XHJcbiAgfVxyXG59O1xyXG4iXX0=