import { Iot, config } from "aws-sdk";  
import { promises } from 'fs';
import { homedir } from 'os';

let certAndKeyLocation: string = `${ homedir }/.aws/iot-credentials`
promises.mkdir(certAndKeyLocation, {recursive: true }).catch(console.error);

config.update({region:'us-west-2'});

// Create an ioT client
let ioT = new Iot();

let createKeyAndCert = async () => {
  try {
    let keysAndCert = await ioT.createKeysAndCertificate({setAsActive: true}).promise();
    try {
      promises.writeFile(`${ certAndKeyLocation }/cert.pem`, keysAndCert.certificatePem);
      console.log("cert.pem file created");
    }
    catch (e) {
      console.log("cert.pem file could not be created", e);
    }
    try {
      promises.writeFile(`${ certAndKeyLocation }/public.key`, keysAndCert.keyPair.PublicKey);
      console.log("public.key file created");
    }
    catch (e) {
      console.log("public.key file could not be created", e);
    }
    try {
      promises.writeFile(`${ certAndKeyLocation }/private.key`, keysAndCert.keyPair.PrivateKey);
      console.log("private.key file created");
    }
    catch (e) {
      console.log("private.key file could not be created", e);
    }
    return keysAndCert.certificateId;
  } catch (e) {
    console.log(e);
  }
}

createKeyAndCert().then((certId) => {
  let params = {
    templateBody: JSON.stringify({ 
      "Parameters" : {
        "ThingName" : {
          "Type" : "String"
        },
        "Location" : {
          "Type" : "String",
          "Default" : "WA"
        },
        "CertificateId" : {
          "Type" : "String"
        }
      },
      "Resources" : {
          "thing" : {
              "Type" : "AWS::IoT::Thing",
              "Properties" : {
                  "ThingName" : { "Ref" : "ThingName" },
              },
              "OverrideSettings" : {
                  "AttributePayload" : "MERGE",
                  "ThingTypeName" : "REPLACE",
                  "ThingGroups" : "DO_NOTHING"
              }
          },  
          "certificate" : {
              "Type" : "AWS::IoT::Certificate",
              "Properties" : {
                  "CertificateId": {"Ref" : "CertificateId"}
              }, 
              "OverrideSettings" : {
                  "Status" : "DO_NOTHING"
              }
          },
          "policy" : {
              "Type" : "AWS::IoT::Policy",
              "Properties" : {
                  "PolicyDocument" : "{ \"Version\": \"2012-10-17\", \"Statement\": [{ \"Effect\": \"Allow\", \"Action\":[\"iot:Publish\"], \"Resource\": [\"arn:aws:iot:us-east-1:123456789012:topic/foo/bar\"] }] }"
              }
          }
      }
    }),
    parameters: {
      "ThingName": "cliTing",
      "Location": "CA",
      "CertificateId": certId.toString()
    }
  }

  // Register a thing 
  ioT.registerThing(params, function(err, data) {
    if (err)
      console.log(err, err.stack);
    else
      console.log(data);
  })

});