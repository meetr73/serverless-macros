import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
//import * as AWS  from 'aws-sdk'
import { CreateMacroRequest } from '../../requests/CreateMacroRequest'
/*
import { parseUserId } from '../../auth/utils'
import * as uuid from 'uuid';
import { getAllGroups } from '../../businessLogic/macro'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TodosTable
*/

import { createMacro } from '../../businessLogic/macro'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateMacroRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]


  /*console.log("newTodo " + newTodo)
  const macroId = uuid.v4()
  const createdAt = new Date().toISOString()
  const newItem = {
    macroId: macroId,
    ...newTodo,
    createdAt:createdAt,
    userId: parseUserId(jwtToken),
  }
*/

  const newItem = await createMacro(newTodo,jwtToken)
  /*
  await docClient.put({
    TableName: todosTable,
    Item: newItem
  }).promise()
*/
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(
      {item:newItem}
    )
  }

}
