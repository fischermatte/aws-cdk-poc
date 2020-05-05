"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const db = new aws_sdk_1.DynamoDB.DocumentClient();
const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`, DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;
exports.handler = async (event = {}) => {
    console.info('yearh i am called...');
    if (!event.body) {
        return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
    }
    const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
    item[PRIMARY_KEY] = uuid_1.v4();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQWlDO0FBQ2pDLCtCQUF3QjtBQUV4QixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7QUFDaEQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO0FBRWxELE1BQU0sRUFBRSxHQUFHLElBQUksa0JBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUV6QyxNQUFNLGlCQUFpQixHQUFHLHlEQUF5RCxFQUNqRix3QkFBd0IsR0FBRywrRkFBK0YsQ0FBQztBQUVoSCxRQUFBLE9BQU8sR0FBRyxLQUFLLEVBQUUsUUFBYSxFQUFFLEVBQWtCLEVBQUU7SUFDL0QsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQ2YsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLHFEQUFxRCxFQUFFLENBQUM7S0FDekY7SUFDRCxNQUFNLElBQUksR0FBRyxPQUFPLEtBQUssQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsU0FBRSxFQUFFLENBQUM7SUFDekIsTUFBTSxNQUFNLEdBQXdDO1FBQ2xELFNBQVMsRUFBRSxVQUFVO1FBQ3JCLElBQUksRUFBRSxJQUFJO0tBQ1gsQ0FBQztJQUVGLElBQUk7UUFDRixNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO0tBQ3RDO0lBQUMsT0FBTyxPQUFPLEVBQUU7UUFDaEIsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDOUQsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLElBQUksS0FBSyxxQkFBcUIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDOUcsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO1FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsQ0FBQztLQUNqRDtBQUNILENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RHluYW1vREJ9IGZyb20gXCJhd3Mtc2RrXCI7XHJcbmltcG9ydCB7djR9IGZyb20gXCJ1dWlkXCI7XHJcblxyXG5jb25zdCBUQUJMRV9OQU1FID0gcHJvY2Vzcy5lbnYuVEFCTEVfTkFNRSB8fCAnJztcclxuY29uc3QgUFJJTUFSWV9LRVkgPSBwcm9jZXNzLmVudi5QUklNQVJZX0tFWSB8fCAnJztcclxuXHJcbmNvbnN0IGRiID0gbmV3IER5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XHJcblxyXG5jb25zdCBSRVNFUlZFRF9SRVNQT05TRSA9IGBFcnJvcjogWW91J3JlIHVzaW5nIEFXUyByZXNlcnZlZCBrZXl3b3JkcyBhcyBhdHRyaWJ1dGVzYCxcclxuICBEWU5BTU9EQl9FWEVDVVRJT05fRVJST1IgPSBgRXJyb3I6IEV4ZWN1dGlvbiB1cGRhdGUsIGNhdXNlZCBhIER5bmFtb2RiIGVycm9yLCBwbGVhc2UgdGFrZSBhIGxvb2sgYXQgeW91ciBDbG91ZFdhdGNoIExvZ3MuYDtcclxuXHJcbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBhbnkgPSB7fSkgOiBQcm9taXNlIDxhbnk+ID0+IHtcclxuICBjb25zb2xlLmluZm8oJ3llYXJoIGkgYW0gY2FsbGVkLi4uJyk7XHJcbiAgaWYgKCFldmVudC5ib2R5KSB7XHJcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlOiA0MDAsIGJvZHk6ICdpbnZhbGlkIHJlcXVlc3QsIHlvdSBhcmUgbWlzc2luZyB0aGUgcGFyYW1ldGVyIGJvZHknIH07XHJcbiAgfVxyXG4gIGNvbnN0IGl0ZW0gPSB0eXBlb2YgZXZlbnQuYm9keSA9PSAnb2JqZWN0JyA/IGV2ZW50LmJvZHkgOiBKU09OLnBhcnNlKGV2ZW50LmJvZHkpO1xyXG4gIGl0ZW1bUFJJTUFSWV9LRVldID0gdjQoKTtcclxuICBjb25zdCBwYXJhbXM6RHluYW1vREIuRG9jdW1lbnRDbGllbnQuUHV0SXRlbUlucHV0ID0ge1xyXG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FLFxyXG4gICAgSXRlbTogaXRlbVxyXG4gIH07XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCBkYi5wdXQocGFyYW1zKS5wcm9taXNlKCk7XHJcbiAgICByZXR1cm4geyBzdGF0dXNDb2RlOiAyMDEsIGJvZHk6ICcnIH07XHJcbiAgfSBjYXRjaCAoZGJFcnJvcikge1xyXG4gICAgY29uc29sZS5lcnJvcihgZmFpbGVkIHRvIHNhdmUgaXRlbSAke0pTT04uc3RyaW5naWZ5KHBhcmFtcyl9YClcclxuICAgIGNvbnN0IGVycm9yUmVzcG9uc2UgPSBkYkVycm9yLmNvZGUgPT09ICdWYWxpZGF0aW9uRXhjZXB0aW9uJyAmJiBkYkVycm9yLm1lc3NhZ2UuaW5jbHVkZXMoJ3Jlc2VydmVkIGtleXdvcmQnKSA/XHJcbiAgICBEWU5BTU9EQl9FWEVDVVRJT05fRVJST1IgOiBSRVNFUlZFRF9SRVNQT05TRTtcclxuICAgIHJldHVybiB7IHN0YXR1c0NvZGU6IDUwMCwgYm9keTogZXJyb3JSZXNwb25zZSB9O1xyXG4gIH1cclxufTtcclxuIl19