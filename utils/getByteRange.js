import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
import fs from 'fs';

export async function getByteRange(pdfPath) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    let byteRange =[];

    // console.log(form);
    // console.log(fields);

    for (const field of fields) {
        // Kiểm tra xem field có phải là Signature (chữ ký) không
        const acroField = field.acroField;
        const type = acroField.dict.get(PDFName.of('FT'));
        if (type !== PDFName.of('Sig')) {
            continue; // Bỏ qua nếu không phải trường chữ ký
        }
        // lấy ByteRange
        const byteRangeArray = acroField.V().get(PDFName.of('ByteRange')).array;
        for ( let i of byteRangeArray ) {
            const ByteRangeValue = i["numberValue"];
            byteRange.push(ByteRangeValue);
        }

        console.log(type);
        console.log("\n \n");
        // console.log(contents);
        console.log("\n \n");
        // console.log(byteRange);
    }
    // throw new Error("Không tìm thấy trường chữ ký hoặc ByteRange trong file PDF.");
    return byteRange;
}

// Chạy thử
getByteRange('./test/test.pdf')
    .then(range => console.log("ByteRange của bạn là:", range))
    .catch(err => console.error("Lỗi:", err.message));


export default getByteRange;