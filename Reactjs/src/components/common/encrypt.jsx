import CryptoJS from "crypto-js";
import { serialize, unserialize } from "php-serialize";
import base64 from 'base-64';
import { API_ENCRYPTION_KEY, ENCRYPTION_IV_KEY, API_DECRYPTION_KEY, DECRYPTION_IV_KEY } from "../constants/SecurityConstant";

class Security {
    constructor() { }

    // Decrypt the incoming data
    decrypt(response, _unserialize = false) {
        const value = response.value;

        try {
            const decrypted = CryptoJS.AES.decrypt(value, CryptoJS.enc.Utf8.parse(API_DECRYPTION_KEY), {
                iv: CryptoJS.enc.Utf8.parse(DECRYPTION_IV_KEY),
                padding: CryptoJS.pad.Pkcs7,
                mode: CryptoJS.mode.CBC,
            }).toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
                throw new Error("Decryption failed. Invalid data.");
            }

            return _unserialize ? unserialize(JSON.parse(decrypted)) : JSON.parse(decrypted);
        } catch (error) {
            console.error("Decryption error:", error);
            throw new Error("DecryptionException - The data could not be decrypted.");
        }
    }

    // Encrypt the outgoing data
    encrypt(data, _serialize = false) {
        try {
            // Serialize the data if needed
            const dataToEncrypt = _serialize ? JSON.stringify(serialize(data)) : JSON.stringify(data);

            const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, CryptoJS.enc.Utf8.parse(API_ENCRYPTION_KEY), {
                iv: CryptoJS.enc.Utf8.parse(ENCRYPTION_IV_KEY),
                padding: CryptoJS.pad.Pkcs7,
                mode: CryptoJS.mode.CBC,
            }).toString();

            if (!encrypted) {
                throw new Error("Encryption failed. Invalid data.");
            }

            return base64.encode(encrypted); // Encoding to base64 to ensure safe transmission
        } catch (error) {
            console.error("Encryption error:", error);
            throw new Error("EncryptionException - The data could not be encrypted.");
        }
    }
}

export default Security;