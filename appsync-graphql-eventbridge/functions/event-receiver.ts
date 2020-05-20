import {Handler} from 'aws-lambda'

export const handler: Handler = async (event) => {
    console.info(`Recevied Event: ${JSON.stringify(event)}`);
    throw new Error("failed to handle event");
}
