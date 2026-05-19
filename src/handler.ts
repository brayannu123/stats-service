import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Event received:', JSON.stringify(event));

    const shortId = event.pathParameters?.shortId;
    if (!shortId) {
      return {
        statusCode: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'shortId is required' }),
      };
    }

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { shortId },
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return {
        statusCode: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Not Found', message: 'Short URL not found' }),
      };
    }

    const { originalUrl, clicks, createdAt, visits } = response.Item;

    // Filtro por fechas si se pasan los query parameters
    let filteredVisits = visits || [];
    const startDate = event.queryStringParameters?.startDate;
    const endDate = event.queryStringParameters?.endDate;

    if (startDate) {
      filteredVisits = filteredVisits.filter((v: string) => v >= startDate);
    }
    if (endDate) {
      filteredVisits = filteredVisits.filter((v: string) => v <= endDate);
    }

    const stats = {
      shortId,
      originalUrl,
      clicks: clicks || 0,
      createdAt,
      visits: filteredVisits,
      filteredClicks: filteredVisits.length
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(stats),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal Server Error', details: (error as Error).message }),
    };
  }
};
