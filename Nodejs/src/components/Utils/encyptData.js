const config = require('config');
const crypto = require('crypto');

// const ECNRYPTION_METHOD = config.get('ECNRYPTION_METHOD');
// const KEY_ENC = config.get('API_KEY_ENC');
// const ENCRYPT_IV_KEY = config.get("API_ENCRYPT_IV_KEY");

// if (!KEY_ENC || !ENCRYPT_IV_KEY || !ECNRYPTION_METHOD) {
//     throw new Error('secretKey, secretIV, and ecnryptionMethod are required');
// }

// const API_KEY_ENC = crypto
//     .createHash('sha512')
//     .update(KEY_ENC)
//     .digest('hex')
//     .substring(0, 32);

// const API_ENCRYPT_IV_KEY = crypto
//     .createHash('sha512')
//     .update(ENCRYPT_IV_KEY)
//     .digest('hex')
//     .substring(0, 16);

const ECNRYPTION_METHOD = config.get('ECNRYPTION_METHOD') || 'aes-256-cbc'; 
const KEY_ENC = config.get('API_KEY_ENC');
const ENCRYPT_IV_KEY = config.get('API_ENCRYPT_IV_KEY');

if (!KEY_ENC || !ENCRYPT_IV_KEY || !ECNRYPTION_METHOD) {
    throw new Error('API_KEY_ENC, API_ENCRYPT_IV_KEY, and ENCRYPTION_METHOD are required');
}

const API_KEY_ENC = crypto
    .createHash('sha512')
    .update(KEY_ENC)
    .digest('hex')
    .substring(0, 32);

const API_ENCRYPT_IV_KEY = crypto
    .createHash('sha512')
    .update(ENCRYPT_IV_KEY)
    .digest('hex')
    .substring(0, 16); 

    
// async function encryptedDataResponse(data) {
//     const cipher = crypto.createCipheriv(ECNRYPTION_METHOD, API_KEY_ENC, API_ENCRYPT_IV_KEY);
//     const message = data ? JSON.stringify(data) : "";
//     let encryptedData = cipher.update(message, "utf-8", "base64");
//     encryptedData += cipher.final("base64");

//     const mac = crypto.createHmac('sha256', API_KEY_ENC)
//         .update(Buffer.from(Buffer.from(API_ENCRYPT_IV_KEY).toString("base64") + encryptedData, "utf-8").toString())
//         .digest('hex');

//     return {
//         'mac': mac,
//         'value': encryptedData
//     };
// }

async function encryptedDataResponse(data) {
    const cipher = crypto.createCipheriv(ECNRYPTION_METHOD, API_KEY_ENC, API_ENCRYPT_IV_KEY);
    const message = data ? JSON.stringify(data) : ""; 
    
    let encryptedData = cipher.update(message, "utf-8", "base64");
    encryptedData += cipher.final("base64");

    const mac = crypto.createHmac('sha256', API_KEY_ENC)
        .update(Buffer.from(API_ENCRYPT_IV_KEY, 'base64') + encryptedData)
        .digest('hex');

    return {
        'mac': mac,
        'value': encryptedData
    };
}

// async function EncryptData(req, res, data) {
//     if (req.headers.env && req.headers.env === "test") {
//         return data;
//     } else {
//         return await encryptedDataResponse(data);
//     }
// }

async function EncryptData(req, res, data) {
    if (req.headers.env && req.headers.env === "test") {
        return data;
    } else {
        return await encryptedDataResponse(data);
    }
}

module.exports = { encryptedDataResponse, EncryptData };