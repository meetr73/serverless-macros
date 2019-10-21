import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
//import * as AWS from 'aws-sdk'
import { parseUserId } from '../../auth/utils'
import { getAllGroups } from '../../businessLogic/macro'


/*const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.MacrosTable*/

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  console.log('Processing event: ', event)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1];

  console.log(parseUserId(jwtToken))
  /*const result = await docClient.scan({
    TableName: todosTable,

  }).promise();*/

  const items = await getAllGroups(jwtToken)

/*
  const result =  await docClient
    .query({
      TableName: todosTable,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': parseUserId(jwtToken),
      }
    })
    .promise()

  const items = result.Items
*/

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
