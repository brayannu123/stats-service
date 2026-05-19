import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

const jsonResponse = (statusCode: number, body: Record<string, unknown>): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders,
  },
  body: JSON.stringify(body),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const method = event.httpMethod || (event as any).requestContext?.http?.method;
    if (method === 'OPTIONS') {
      return {
        statusCode: 204,
        headers: corsHeaders,
        body: '',
      };
    }

    if (!TABLE_NAME) {
      return jsonResponse(500, { error: 'TABLE_NAME is not configured' });
    }

    const shortId = event.pathParameters?.shortId;
    if (!shortId) {
      return jsonResponse(400, { error: 'shortId is required' });
    }

    const response = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { shortId },
      })
    );

    if (!response.Item) {
      return jsonResponse(404, { error: 'Not Found', message: 'Short URL not found' });
    }

    const { originalUrl, clicks, createdAt, visits } = response.Item;
    const startDate = event.queryStringParameters?.startDate;
    const endDate = event.queryStringParameters?.endDate;
    let filteredVisits = Array.isArray(visits) ? visits : [];

    if (startDate) {
      filteredVisits = filteredVisits.filter((visit: string) => visit >= startDate);
    }

    if (endDate) {
      filteredVisits = filteredVisits.filter((visit: string) => visit <= endDate);
    }

    return jsonResponse(200, {
      shortId,
      originalUrl,
      clicks: clicks || 0,
      createdAt,
      visits: filteredVisits,
      filteredClicks: filteredVisits.length,
    });
  } catch (error) {
    console.error('Error loading stats:', error);
    return jsonResponse(500, { error: 'Internal Server Error', details: (error as Error).message });
  }
};
