import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getPayment } from './lib/payments';
import { buildResponse } from './lib/apigateway';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try {
        const paymentId = event.pathParameters?.id

        if (!paymentId) {
            return buildResponse(400, { message: 'Missing payment ID in the path' });
        }

        const payment = await getPayment(paymentId);

        if (!payment) {
            return buildResponse(404, { message: `Payment with id ${paymentId} not found` });
        }

        return buildResponse(200, { ...payment });
    } catch (error) {
        console.error('Error retrieving payment:', error);
        return buildResponse(500, { message: 'Unexpected Internal Server Error' });
    }
};
