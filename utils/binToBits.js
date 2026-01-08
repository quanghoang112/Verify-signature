import fs from 'fs';

export function binToBitArray(filePath) {
    const buffer = fs.readFileSync(filePath);
    const bits = [];

    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        // Duyệt từng bit từ cao đến thấp (Big-endian - chuẩn SHA256)
        for (let j = 7; j >= 0; j--) {
            bits.push((byte >> j) & 1);
        }
    }
    return bits;
}

// const messageBits = binToBitArray('extracted_data.bin');
// console.log("Số lượng bit:", messageBits.length);
// console.log("Bit array:", messageBits.join(""));
// Đây là giá trị 'n' bạn cần điền vào Sha256Check(n)


export default binToBitArray;