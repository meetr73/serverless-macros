import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateMacrosRequest } from '../../requests/UpdateMacrosRequest'
//import * as AWS from 'aws-sdk'
/*
import { parseUserId } from '../../auth/utils'
import { createMacro } from '../../businessLogic/macro'


const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TodosTable
*/
import { updateMacros } from '../../businessLogic/macro'
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const macroId = event.pathParameters.macroId
  const updatedTodo: UpdateMacrosRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  //console.log("updatedTodo " + JSON.stringify(updatedTodo))
    //const createdAt = new Date().toISOString()
/*
  const newItem = {
    ...updatedTodo,
    createdAt:createdAt

  }
*/
//  console.log('Storing new item: ', newItem)
   await updateMacros(macroId,updatedTodo,jwtToken)
/*
  await docClient
    .update({
      TableName: todosTable,
      Key: {
        userId :parseUserId(jwtToken),
        macroId: macroId
      },
      UpdateExpression: "set  dueDate=:dueDate, done=:done",
      ExpressionAttributeValues:{
        ":dueDate":newItem.dueDate,
        ":done":newItem.done
      },
    })
    .promise()
*/

  return {
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    statusCode: 200,
    body: JSON.stringify('')
  }
  return undefined
}
