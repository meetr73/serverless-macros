import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as middy from 'middy'
import * as uuid from 'uuid'
import { parseUserId } from '../../auth/utils'



const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new AWS.S3({
  signatureVersion: 'v4'
})


const todosTable = process.env.MacrosTable
const imagesTable = process.env.IMAGES_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
export const handler: APIGatewayProxyHandler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  //const macroId = event.pathParameters.macroId

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  console.log('Caller event', event)
  const macroId = event.pathParameters.macroId
  const validGroupId = await groupExists(macroId,jwtToken)

  if (!validGroupId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Macro does not exist'
      })
    }
  }

  const imageId = uuid.v4()
  const newItem = await createImage(macroId, imageId, event)
  console.log(newItem)
  const url = getUploadUrl(imageId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl : url
    })
  }
  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return undefined
})


async function groupExists(macroId: string,jwtToken:string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        userId :parseUserId(jwtToken),
        macroId: macroId
      }
    })
    .promise()

  console.log('Get group: ', result)
  return !!result.Item
}

async function createImage(macroId: string, imageId: string, event: any) {
  const createdAt = new Date().toISOString()
  const newImage = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1];

  const newItem = {
    macroId,
    createdAt,
    imageId,
    ...newImage,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
  }
  console.log('Storing new item: ', newItem)

  await docClient
    .put({
      TableName: imagesTable,
      Item: newItem
    })
    .promise()


  await docClient
    .update({
      TableName: todosTable,
      Key: {
        userId :parseUserId(jwtToken),
        macroId: macroId
      },
      UpdateExpression: "set  attachmentUrl= :attachmentUrl",
      ExpressionAttributeValues:{
        ":attachmentUrl":newItem.imageUrl,

      },
    })
    .promise();


  return newItem
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}
