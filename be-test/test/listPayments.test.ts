import * as payments from '../src/lib/payments';
import { randomUUID } from 'crypto';
import { handler } from '../src/listPayments';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user requests lists the records', () => {
    it('Returns the records matching the specific currency.', async () => {
        const paymentId = randomUUID();
        const mockPayments = [{
            id: paymentId,
            currency: 'SGD',
            amount: 2000,
        }];
        const getPaymentMock = jest.spyOn(payments, 'listPayments').mockResolvedValueOnce(mockPayments);

        const result = await handler({
            queryStringParameters: {
                currency: 'SGD',
            },
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toEqual(expect.objectContaining({
            data: mockPayments
        }));

        expect(getPaymentMock).toHaveBeenCalledWith('SGD');
    });

});

afterEach(() => {
    jest.resetAllMocks();
});
