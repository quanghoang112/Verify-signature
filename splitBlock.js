// install: npm install crypto
// const crypto = require("crypto");
// const fs = require("fs");
import hash from 'hash.js';
import crypto from "crypto";
import fs from "fs";
// Hàm chuyển buffer sang mảng bit
import {bufferToBits} from "./utils/bufferToBits.js";



// Giả sử message 1024 bit (128 bytes)
// const message = Buffer.alloc(129, 0x61); // Ví dụ chuỗi toàn ký tự 'a'
// let message = "Hello Circom! My name is BlahBlah, nice to meet you. How are you today? I'm fine, thanks for asking!\n";
// message = Buffer.from(message, "utf8");

const message = fs.readFileSync('extracted_data.bin');

console.log("Message Hex: ", message.length/64);

// Lấy khối 1 (64 bytes đầu tiên)
let block=message.subarray(0, message.length<64 ? message.length:64);
let sha=hash.sha256().update(block);
// Lấy khối 1 (64 bytes đầu tiên)
for (let i = 1; i <= Math.floor(message.length/64)-1; i++)
{
  block = message.subarray(64*i, 64*(i+1));

  sha.update(block);
  const internalState = sha.h; // Đây chính là mảng 8 số 32-bit bạn cần
  // console.log("8 giá trị h cho Circom:", internalState);
  console.log(`i: ${i}`);
}
// Lấy khối 2 (64 bytes còn lại)
console.log("block: ",block);
const final = message.length%64 == 0 || message.length < 64 ? 0 : message.subarray(64*(Math.floor(message.length/64)), message.length);
console.log("Final block:", final);

const shaFinal = final != 0 ? sha.update(final): sha;
const finalHash = shaFinal.digest(`hex`);

console.log("Hash cuối cùng:",finalHash);
// Ví dụ message
// const message = "Hello Circom! My name is BlahBlah, nice to meet you. How are you today? I'm fine, thanks for asking!\n";
const messageBuffer = Buffer.from(message, "utf8");

// Hash SHA256
const hashBuffer = crypto.createHash("sha256").update(messageBuffer).digest();
// const hashBuffer = `382deb1bcd894dd388b74302e3398918804a238ed02f653fc86ab24afda3dcc4`;

console.log("hashBuffer: ", hashBuffer.toString("hex"));
// Chuyển sang bit array
const messageBits = bufferToBits(messageBuffer);
const expectedHashBits = bufferToBits(hashBuffer);

// console.log("Message Bits: ", messageBits.join(''));
// console.log("Expected Hash Bits: ", expectedHashBits.join(''));
// console.log("Message Bits length: ", messageBits.length);
// console.log("Expected Hash Bits length: ", expectedHashBits.length);
// Tạo input JSON cho Circom
const input = {
  message: messageBits,
  expectedHash: expectedHashBits
};
fs.writeFileSync("input.json", JSON.stringify(input, null, 2));
