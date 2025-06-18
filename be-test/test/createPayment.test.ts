import * as payments from '../src/lib/payments';
import { handler } from '../src/createPayment';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('When the user creates a payment', () => {
    it('Returns the generated payment id.', async () => {

        const mockPayment = {
            currency: 'AUD',
            amount: 2000,
        };

        const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce();

        const result = await handler({
            body: JSON.stringify(mockPayment),
        } as unknown as APIGatewayProxyEvent);

        expect(result.statusCode).toBe(201);
        expect(JSON.parse(result.body).result).toEqual(expect.any(String));

        expect(createPaymentMock).toHaveBeenCalledWith(expect.objectContaining({
            id: expect.any(String),
            ...mockPayment
        }));
    });

    describe('validation error', () => {

        it('Should throw error if the amount is not defined.', async () => {

            const mockPayment = {
                currency: 'AUD',
            };

            const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce();

            const result = await handler({
                body: JSON.stringify(mockPayment),
            } as unknown as APIGatewayProxyEvent);

            expect(result.statusCode).toBe(422);
            expect(JSON.parse(result.body)).toEqual(expect.objectContaining({
                errors: [{ field: 'amount', message: 'This field is required.' }]
            }));

            expect(createPaymentMock).not.toHaveBeenCalled()
        });

        it('Should throw error if the currency is not defined.', async () => {

            const mockPayment = {
                amount: 2000
            };

            const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce();

            const result = await handler({
                body: JSON.stringify(mockPayment),
            } as unknown as APIGatewayProxyEvent);

            expect(result.statusCode).toBe(422);
            expect(JSON.parse(result.body)).toEqual(expect.objectContaining({
                errors: [{ field: 'currency', message: 'This field is required.' }]
            }));

            expect(createPaymentMock).not.toHaveBeenCalled()
        });

        it('Should throw error if the amount has invalid data type', async () => {

            const mockPayment = {
                amount: '2000',
                currency: 'AUD'
            };

            const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce();

            const result = await handler({
                body: JSON.stringify(mockPayment),
            } as unknown as APIGatewayProxyEvent);

            expect(result.statusCode).toBe(422);
            expect(JSON.parse(result.body)).toEqual(expect.objectContaining({
                errors: [{ field: 'amount', message: 'Must be a number.' }]
            }));

            expect(createPaymentMock).not.toHaveBeenCalled()
        });

        it('Should throw error if the currency has invalid data type', async () => {

            const mockPayment = {
                amount: 2000,
                currency: 1
            };

            const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce();

            const result = await handler({
                body: JSON.stringify(mockPayment),
            } as unknown as APIGatewayProxyEvent);

            expect(result.statusCode).toBe(422);
            expect(JSON.parse(result.body)).toEqual(expect.objectContaining({
                errors: [{ field: 'currency', message: 'Must be a string.' }]
            }));

            expect(createPaymentMock).not.toHaveBeenCalled()
        });

        it('Should throw error if the currency is not supported', async () => {

            const mockPayment = {
                amount: 2000,
                currency: 'INR'
            };

            const createPaymentMock = jest.spyOn(payments, 'createPayment').mockResolvedValueOnce();

            const result = await handler({
                body: JSON.stringify(mockPayment),
            } as unknown as APIGatewayProxyEvent);

            expect(result.statusCode).toBe(422);
            expect(JSON.parse(result.body)).toEqual(expect.objectContaining({
                errors: [{ field: 'currency', message: 'This value INR is not supported.' }]
            }));

            expect(createPaymentMock).not.toHaveBeenCalled()
        });

    })

});

afterEach(() => {
    jest.resetAllMocks();
});
