let cognitoUser = this.$store.cognitoUser
let region = process.env.REGION || 'us-east-1'
let userPoolId = process.env.USER_POOL_ID
let loginKey = 'cognito-idp.' + region + '.amazonaws.com/' + userPoolId
let Logins = {}
Logins[loginKey] = cognitoUser.getSignInUserSession().getIdToken().getJwtToken()

var cognitoidentity = new AWS.CognitoIdentity({apiVersion: '2014-06-30'})
var params = {
  IdentityId: AWS.config.credentials.identityId,
  // Logins  // 登陆用户似乎就是不能访问
}

cognitoidentity.getCredentialsForIdentity(params, function (err, data) {
  if (err) {
    console.log(err)
  }
  else {
    const mqttClient = AWSIoTData.device({
      region: process.env.AWS_REGION,
      host: process.env.AWS_IOT_ENDPOINT_HOST.toLowerCase(),
      clientId: '121323', // To identify different client. Can be random string
      protocol: 'wss',
      maximumReconnectTimeMs: 8000,
      debug: true,
      accessKeyId: data.Credentials.AccessKeyId,
      secretKey: data.Credentials.SecretKey,
      sessionToken: data.Credentials.SessionToken
    })
    mqttClient.on('error', function (err) {
      console.log(err)
    })

    mqttClient.on('connect', function () {
      console.log('connected')
      mqttClient.subscribe('5ade6a3ab3afff3cf9c771e7') // subscribe a topic
    })
    mqttClient.on('message', function (topics, message) {
      console.log(topics)
      console.log(message)
    })
  }
})

// References:
// https://github.com/aws/aws-iot-device-sdk-js#examples  :  MQTT Explorer Browser Example Application
// https://github.com/aws/aws-iot-device-sdk-js/blob/master/examples/browser/mqtt-webpack/entry.js
// https://docs.aws.amazon.com/zh_cn/cognito/latest/developerguide/amazon-cognito-integrating-user-pools-with-identity-pools.html