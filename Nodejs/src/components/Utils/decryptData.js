const config = require('config');
const ECNRYPTION_METHOD = config.get('ECNRYPTION_METHOD');
const crypto = require('crypto');
// const KEY_ENC = config.get('API_KEY_DEC');
// const ENCRYPT_IV_KEY = config.get("API_DECRYPT_IV_KEY");

const KEY_DEC = config.get('API_KEY_DEC');
const DECRYPT_IV_KEY = config.get("API_DECRYPT_IV_KEY");

const API_KEY_DEC = crypto
    .createHash('sha512')
    .update(KEY_DEC)
    .digest('hex')
    .substring(0, 32)
    
const API_DECRYPT_IV_KEY = crypto
    .createHash('sha512')
    .update(DECRYPT_IV_KEY)
    .digest('hex')
    .substring(0, 16)
    
//Decrypt Data
async function decryptedDataResponse(mac, value) {
    const buff = Buffer.from(value, 'base64')
    const decipher = crypto.createDecipheriv(ECNRYPTION_METHOD, API_KEY_DEC, API_DECRYPT_IV_KEY)
    let decrypted = decipher.update(buff.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    // console.log("bff:", decrypted);
    return JSON.parse(decrypted);  
}

module.exports = {decryptedDataResponse};