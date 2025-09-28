
const CryptoJS = require("crypto-js");


const KEY = process.env.ENCRYPTION_KEY!;

export const encrypt = (data: string) => {
    return CryptoJS.AES.encrypt(data, KEY);
}

export const decrypt = (data: string) => {
    var decryptedBytes = CryptoJS.AES.decrypt(data, KEY);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
}