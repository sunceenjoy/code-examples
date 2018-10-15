/*global exports, console */
const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const publicKeys = {"keys":[{"alg":"RS256","e":"AQAB","kid":"zy6C6M6EGRwYLfhwnG8cuzh8vlVQTNjNJuPs8idXyag=","kty":"RSA","n":"spnKIifabXwILyuyUy2dT2bcj0lj5FkhkgBi04r1mIOayrxRJnT60Bxvcjb4lFUQw9qJhk8H14Ks0Kn4TtAFdgU-DhmAIdiWASot8rHZCUWsGsZCrMU9fBu7tW3ZPxkE_pJLmeVRJfjSS52e-bXuKERwI1ELx3dI5C5joY7i1C-RjM7puLtZhksdy7zZ_pcrtxDVrVxdoQAneT-f2Lb3x53uh1IJUKGdnsAXoQiD1xbAQSf1rgT39sPn6gkZwNwT0gWUYa3olqN7AQcIKGSpwCJsN_rBCUoufkdDZu2ePtPCKlvwQaNNX9lsL1wt-1h3uGdZe1JCJEMGHU0KOPZsWw","use":"sig"},{"alg":"RS256","e":"AQAB","kid":"qDo+WNMaqNmkGl0/nosJew3xw9Y+PUnG80OtdThH4Ns=","kty":"RSA","n":"gphtTWqlO9PIL6PogSk_bteSOXyZxnhCCd6YsC0S4atskyoKiy8m7AHES5kHBPHNd0UgSXngUHj3qG7AwDFlYnFtNdsjEPYBIgR8s7LVNPHOpE6tCSZPq1Pu9kMXah0usf0_1VDZrMPoNzqiacZP8AL0V_BFbSHwH3T-Ifd0w8f8Jo-c6fwF9j49YU2QtA63KI5mmOj3-v9MZ-XfSeg4qT6q6kPDIJpiPezVQd4yg2Q1VDpwBifMw0v0TcU650fYfz2dfGunVxZ7rMZELlSODVHDYt2sqiCqZaCekEsdYFrHykM2Li5Vc3zlhyplOxkkaxsta-eFFn8L1GguOMFsdQ","use":"sig"}]}
const token = require('./service/token')

var generatePolicy = function (event) {
  const cert = jwkToPem(publicKeys.keys[0])
  const authToken = event.headers.Authorization.replace('Bearer ', '')
  const methodArn = event.methodArn
  const claims = jwt.verify(authToken, cert)
  const bbId = claims['custom:bbId']
  const cid = event.headers.cid || 'all'

  if (!token.verify(bbId, cid)) {
    throw new Error('kicked out')
  }

	const policy = {
		principalId: JSON.stringify({'email': claims['email'], 'custom:bbId': claims['custom:bbId']}),
		'policyDocument': {
			'Version': '2012-10-17',
			'Statement': [{
				'Effect': 'Allow',
				'Action': [
					'execute-api:Invoke'
				],
				'Resource': [
					methodArn
				]
			}]
		}
	}
  return policy
}

function handleCognitoTriggers (event, context, callback) {
  if (event.triggerSource ==='PostAuthentication_Authentication' || event.triggerSource.indexOf('TokenGeneration') !== -1) {
    const user = event.request.userAttributes
    token.reset(user['custom:bbId'])

    if (event.triggerSource.indexOf('TokenGeneration') !== -1) {
      event.response = {}
    }
    return callback(null, event)
  }
}

function handleCustomAuthorizer (event, context, callback) {
  try {
    const policy = generatePolicy(event)
    callback(null, policy)
  }
  catch (err) {
    if (err.message === 'kicked out') {
      return callback(null, {
        'policyDocument': {
          'Version': '2012-10-17',
          'Statement': [{
            'Effect': 'Deny',
            'Action': [
              'execute-api:Invoke'
            ],
            'Resource': [
              event.methodArn
            ]
          }]
        }
      })
    }
    callback('Unauthorized')
  }
}

exports.handler = function testAuth(event, context, callback) {
  try {
    if (event.triggerSource) {
      // cognito triggers
      handleCognitoTriggers(event, context, callback)
    } else {
      // custom authorizor
      handleCustomAuthorizer(event, context, callback)
    }
  } catch (err) {
    callback('error')
  }
}