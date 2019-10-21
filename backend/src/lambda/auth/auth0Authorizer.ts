import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { verify ,  decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { cors } from 'middy/middlewares'
const logger = createLogger('auth')
//const secret = process.env.AUTH_0_SECRET_ID

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = '-----BEGIN CERTIFICATE-----\n' +
  'MIIC/TCCAeWgAwIBAgIJAsekjSrw3x6dMA0GCSqGSIb3DQEBCwUAMBwxGjAYBgNV\n' +
  'BAMTEW1lZXRyNzMuYXV0aDAuY29tMB4XDTE5MTAwNTIxMjk0NloXDTMzMDYxMzIx\n' +
  'Mjk0NlowHDEaMBgGA1UEAxMRbWVldHI3My5hdXRoMC5jb20wggEiMA0GCSqGSIb3\n' +
  'DQEBAQUAA4IBDwAwggEKAoIBAQDHRTlnq6ziGOm8ms7kgGXJCZr4Lv37M+oWRwbG\n' +
  'D4vBQ5vmDHsdW4rfEgDPrtkpfkH26quesk+QqR34VubHwAbm81Rr9YWi3IZDlVHc\n' +
  'myJ86vDc1ZueKkHPUQvJxYPmEYTTqLtOYbB34AJ+3f8ElAiSt8dCw9U+spQyn5Te\n' +
  'V8sBcvJ9PjONpFkKPN3RkaiDU7E304jAYVVBhufiNV8Q/l/+t9YHlhufg/0RnBLS\n' +
  'ZfSEn0jxVYtyXe1XvBFsD+yRVPpcn1p5Aey+lO7DJYSj1VaF0hnS7lS3/LdLvJBi\n' +
  'WyE162u88IXwhs24X5wSyM2EnFZXSV4Lm5vgW9RYny9+Ut5NAgMBAAGjQjBAMA8G\n' +
  'A1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFDarVULUdSYSbQvDa8UzFTfeA+KlMA4G\n' +
  'A1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAL71DBxFoFx0XNghuW4lm\n' +
  'n9oaHY070Tj6PrT4emsCcvSJ2jxsCrnNeohQrx163GeSkCCry47DkD4urfLxfTZb\n' +
  '5QJTgZyVpMHsL771Bm/O3DnaXfPIVfEiyB84FzzHqGfg+4Xm3689y8haeUBXVF/8\n' +
  'Bl0mlMfWjyqArxzfh6McgjofZ2o7NccWXCfaxBwDaXETcDOhyLOjxjAJf95YukOb\n' +
  'f0q0BtEvxp1erAWZLvix9bnmMJ+TF96fWh1uYE0zUi6wkSZlNbtwlhi2htiagnYk\n' +
  'WLC30cjcywT6buRKxWHJzxEtVpb2A6UDLWs+DO1+FjN1frmnfpyAciJW7KenfcnO\n' +
  'dg==\n' +
  '-----END CERTIFICATE-----\n'

export const handler = middy(async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)
    console.log("jwtToken" + JSON.stringify(jwtToken))
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  console.log("jwt " + jwt)
  console.log("token " + token )
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, jwksUrl) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

handler.use(
  cors({
    credentials: true
  })
)
