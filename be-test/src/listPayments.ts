import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from './lib/apigateway';
import { listPayments } from './lib/payments';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try {
        const currency = event.queryStringParameters?.currency

        if (currency && typeof currency !== 'string') {
            return buildResponse(400, { message: 'Invalid currency parameter' });
        }

        const payments = await listPayments(currency);

        return buildResponse(200, { data: payments });
    } catch (error) {
        console.error('Error retrieving payments:', error);
        return buildResponse(500, { message: 'Unexpected Internal Server Error' });
    }
};
