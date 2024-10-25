import CryptoJS from "crypto-js";
import { serialize, unserialize } from "php-serialize";
import base64 from 'base-64';
import { API_ENCRYPTION_KEY, ENCRYPTION_IV_KEY, API_DECRYPTION_KEY, DECRYPTION_IV_KEY } from "../constants/SecurityConstant";

class Security {
    constructor() { }

    encrypt(value, _serialize = false) {
        const iv = ENCRYPTION_IV_KEY;
   
        const dataToEncrypt = _serialize ? serialize(JSON.stringify(value)) : JSON.stringify(value);
        const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, CryptoJS.enc.Utf8.parse(API_ENCRYPTION_KEY), {
            iv: CryptoJS.enc.Utf8.parse(iv),
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC,
        }).toString();

        const base64Iv = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(iv));
        const mac = CryptoJS.HmacSHA256(base64Iv + encrypted, API_ENCRYPTION_KEY).toString();

        return { value: encrypted, mac };
    }

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

}

export default Security; 