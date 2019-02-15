"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var aws_sdk_1 = require("aws-sdk");
var fs_1 = require("fs");
var os_1 = require("os");
var certAndKeyLocation = os_1.homedir + "/.aws/iot-credentials";
fs_1.promises.mkdir(certAndKeyLocation, { recursive: true })["catch"](console.error);
aws_sdk_1.config.update({ region: 'us-west-2' });
// Create an ioT client
var ioT = new aws_sdk_1.Iot();
var createKeyAndCert = function () { return __awaiter(_this, void 0, void 0, function () {
    var keysAndCert, fileName, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, ioT.createKeysAndCertificate({ setAsActive: true }).promise()];
            case 1:
                keysAndCert = _a.sent();
                fileName = void 0;
                try {
                    fileName = 'cert.pem';
                    fs_1.promises.writeFile(certAndKeyLocation + "/cert.pem", keysAndCert.certificatePem);
                    console.log(fileName + " file created");
                    fileName = 'public.key';
                    fs_1.promises.writeFile(certAndKeyLocation + "/public.key", keysAndCert.keyPair.PublicKey);
                    console.log(fileName + " file created");
                    fileName = 'private.key';
                    fs_1.promises.writeFile(certAndKeyLocation + "/private.key", keysAndCert.keyPair.PrivateKey);
                    console.log(fileName + " file created");
                }
                catch (e) {
                    console.log("Error: " + fileName + " file could not be created", e);
                }
                return [2 /*return*/, keysAndCert.certificateId];
            case 2:
                e_1 = _a.sent();
                console.log(e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
createKeyAndCert().then(function (certId) {
    var params = {
        templateBody: JSON.stringify({
            "Parameters": {
                "ThingName": {
                    "Type": "String"
                },
                "Location": {
                    "Type": "String",
                    "Default": "WA"
                },
                "CertificateId": {
                    "Type": "String"
                }
            },
            "Resources": {
                "thing": {
                    "Type": "AWS::IoT::Thing",
                    "Properties": {
                        "ThingName": { "Ref": "ThingName" }
                    },
                    "OverrideSettings": {
                        "AttributePayload": "MERGE",
                        "ThingTypeName": "REPLACE",
                        "ThingGroups": "DO_NOTHING"
                    }
                },
                "certificate": {
                    "Type": "AWS::IoT::Certificate",
                    "Properties": {
                        "CertificateId": { "Ref": "CertificateId" }
                    },
                    "OverrideSettings": {
                        "Status": "DO_NOTHING"
                    }
                },
                "policy": {
                    "Type": "AWS::IoT::Policy",
                    "Properties": {
                        "PolicyDocument": "{ \"Version\": \"2012-10-17\", \"Statement\": [{ \"Effect\": \"Allow\", \"Action\":[\"iot:Publish\"], \"Resource\": [\"arn:aws:iot:us-east-1:123456789012:topic/foo/bar\"] }] }"
                    }
                }
            }
        }),
        parameters: {
            "ThingName": "macbookTing",
            "Location": "CA",
            "CertificateId": certId.toString()
        }
    };
    // Register a thing 
    ioT.registerThing(params, function (err, data) {
        if (err)
            console.log(err, err.stack);
        else
            console.log(data);
    });
});
