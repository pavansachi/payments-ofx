import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/getPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user requests the records for a specific payment', () => {
    it('Returns the payment matching their input parameter.', async () => {
        const paymentId = randomUUID();
        const mockPayment = {
            id: paymentId,
            currency: 'AUD',
            amount: 2000,
        };
        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(mockPayment);

        const result = await handler({
            pathParameters: {
                id: paymentId,
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(mockPayment);

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });

    it('Should throw 404 error if payment id is not found in database.', async () => {
        const paymentId = randomUUID();

        const getPaymentMock = jest.spyOn(payments, 'getPayment').mockResolvedValueOnce(null);

        const result = await handler({
            pathParameters: {
                id: paymentId,
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(404);
        expect(JSON.parse(result.body)).toEqual(expect.objectContaining({
            message: `Payment with id ${paymentId} not found`
        }));

        expect(getPaymentMock).toHaveBeenCalledWith(paymentId);
    });
});

afterEach(() => {
    jest.resetAllMocks();
});
