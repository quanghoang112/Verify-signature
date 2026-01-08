import fs from 'fs';
import {getByteRange} from './getByteRange.js';

/**
 * Cắt PDF dựa trên ByteRange và lưu thành file .bin
 * @param {string} inputPath - Đường dẫn file PDF gốc
 * @param {string} outputPath - Đường dẫn file .bin đầu ra
 * @param {Array<number>} byteRange - Mảng [o1, l1, o2, l2] lấy từ /ByteRange
 */
export function extractPdfToBin(inputPath, outputPath, byteRange) {
    try {
        // 1. Đọc toàn bộ file PDF vào một Buffer
        const fullBuffer = fs.readFileSync(inputPath);

        const [o1, l1, o2, l2] = byteRange;

        // 2. Cắt các đoạn theo ByteRange
        // Đoạn 1: Thường từ đầu file đến trước chữ ký
        const part1 = fullBuffer.subarray(o1, o1 + l1);
        
        // Đoạn 2: Thường từ sau chữ ký đến hết file
        const part2 = fullBuffer.subarray(o2, o2 + l2);

        // 3. Nối các đoạn lại với nhau
        const combinedBuffer = Buffer.concat([part1, part2]);

        // 4. Ghi ra file .bin
        fs.writeFileSync(outputPath, combinedBuffer);

        console.log(`✅ Đã trích xuất thành công ${combinedBuffer.length} bytes vào ${outputPath}`);
    } catch (error) {
        console.error("❌ Lỗi khi cắt file:", error.message);
    }
}

const myByteRange = await getByteRange('test/test.pdf');
console.log("Sử dụng ByteRange:", myByteRange);
extractPdfToBin('test/test.pdf', 'extracted_data.bin', myByteRange);
export default extractPdfToBin;