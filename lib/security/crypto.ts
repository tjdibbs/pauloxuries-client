import CryptoJS from "crypto-js";

// Encrypt
export const encrypt = (data: any) => {
  return CryptoJS.AES.encrypt(data, "secret key 123").toString();
};

// Decrypt
export const decrypt = (ciphertext: string) => {
  let bytes = CryptoJS.AES.decrypt(ciphertext, "secret key 123");
  return bytes.toString(CryptoJS.enc.Utf8);
};
