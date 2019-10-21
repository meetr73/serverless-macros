import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { parseUserId } from '../../auth/utils'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)


const docClient = new XAWS.DynamoDB.DocumentClient()
const todosTable = process.env.MacrosTable



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const macroId = event.pathParameters.macroId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  // TODO: Remove a TODO item by id
  console.log(parseUserId(jwtToken))
  const key = {
    userId :parseUserId(jwtToken),
    macroId: macroId
  }

  console.log('Removing item with key: ', key)

  await docClient.delete({
    TableName: todosTable,
    Key: key
  }).promise()

  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
      "Access-Control-Allow-Credentials" : true
    },
    statusCode: 200,
    body: JSON.stringify("")
  }
}
