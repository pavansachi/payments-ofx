import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, parseInput } from './lib/apigateway';
import { createPayment, Payment } from './lib/payments';
import { randomUUID } from 'crypto';

export type ValidationError = {
    field: string;
    message: string;
};

const supportedCurrencies = ['AUD', 'USD', 'EUR', 'GBP', 'JPY', 'NZD', 'SGD'] as const;
type SupportedCurrency = typeof supportedCurrencies[number];
const supportedCurrenciesSet = new Set(supportedCurrencies);

function isSupportedCurrency(c: any): c is SupportedCurrency {
    return supportedCurrenciesSet.has(c);
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const errors: ValidationError[] = [];

    try {
        const payment = parseInput(event.body || '{}') as Omit<Payment, 'id'>;

        /*
            using a vanilla implementation for validation
            Improvements: use a validation framework like zod
        */

        // validate amount
        if (payment.amount === undefined) {
            errors.push({ field: 'amount', message: 'This field is required.' });
        } else if (typeof payment.amount !== 'number') {
            errors.push({ field: 'amount', message: 'Must be a number.' });
        }

        let currency = payment.currency;
        // validate currency
        if (currency === undefined) {
            errors.push({ field: 'currency', message: 'This field is required.' });
        } else if (typeof currency !== 'string') {
            errors.push({ field: 'currency', message: 'Must be a string.' });
        } else if (!isSupportedCurrency(currency.toUpperCase())) {
            errors.push({ field: 'currency', message: `This value ${currency.toUpperCase()} is not supported.` });
        }

        if (errors.length > 0) {
            return buildResponse(422, {
                message: 'Invalid input provided.',
                errors: errors
            });
        }

        const paymentId = randomUUID();
        const paymentToCreate: Payment = { ...payment, id: paymentId, currency: payment.currency.toUpperCase() };

        await createPayment(paymentToCreate);
        return buildResponse(201, { result: paymentId });
    } catch (error) {
        console.error('Error creating payment:', error);
        return buildResponse(500, { message: 'Unexpected Internal Server Error' });
    }
};
