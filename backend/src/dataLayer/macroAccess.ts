import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { MacroItem } from '../models/MacroItem'
import { MacroUpdate } from '../models/MacroUpdate'
import { parseUserId } from '../auth/utils'

export class MacroAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.MacrosTable) {
  }

  async getAllMacros(jwtToken: string): Promise<MacroItem[]> {
    console.log('Getting all groups')

    const result = await this.docClient
        .query({
          TableName: this.todosTable,
          IndexName: 'UserIdIndex',
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': parseUserId(jwtToken),
          }
        })
        .promise()

    const items = result.Items
    return items as MacroItem[]
  }

  async createMacro(todo: MacroItem): Promise<MacroItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo
  }


  async updateMacros(todo: MacroUpdate,macroId:string, jwtToken: string): Promise<MacroUpdate> {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId :parseUserId(jwtToken),
        macroId: macroId
      },
      UpdateExpression: "set  dueDate=:dueDate, done=:done",
      ExpressionAttributeValues:{
        ":dueDate":todo.dueDate,
        ":done":todo.done
      },
    }).promise()

    return todo
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
