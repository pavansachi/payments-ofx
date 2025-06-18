import { DocumentClient } from './dynamodb';
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export const getPayment = async (paymentId: string): Promise<Payment | null> => {
    const result = await DocumentClient.send(
        new GetCommand({
            TableName: 'Payments',
            Key: { paymentId },
        })
    );

    if (!result.Item) {
        return null;
    }

    const { paymentId: pid, ...rest } = result.Item as Omit<Payment, 'id'> & { paymentId: string }

    return { ...rest, id: pid }
};

export const listPayments = async (currency?: Payment['currency']): Promise<Payment[]> => {

    const params: any = {
        TableName: 'Payments',
    };

    if (currency) {
        params.FilterExpression = 'currency = :currency';
        params.ExpressionAttributeValues = {
            ':currency': currency,
        };
    }

    /*
      FilterExpression is applied after reading all data on client and can be slow
      Improvements: Add GSI on the currency field and use QueryCommand. This will be performant for large tables.
    */

    const mapItem = (item: any): Payment => {
        const { paymentId, ...rest } = item;
        return { ...rest, id: paymentId };
    }

    const result = await DocumentClient.send(new ScanCommand(params));
    return (result.Items ?? []).map(mapItem);
};

export const createPayment = async (payment: Payment) => {

    const { id, ...rest } = payment;

    await DocumentClient.send(
        new PutCommand({
            TableName: 'Payments',
            Item: { ...rest, paymentId: id, },
        })
    );
};

export type Payment = {
    id: string;
    amount: number;
    currency: string;
};
