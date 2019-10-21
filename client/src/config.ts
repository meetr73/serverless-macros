// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'pdfz344og6'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'meetr73.auth0.com',
  clientId: 'V4LL4wx7jqCDj7hJS04NshHQDi1M7zkT',
  callbackUrl: 'http://localhost:3000/callback'
}
