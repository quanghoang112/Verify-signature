import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
import fs from 'fs';
import { get } from 'http';

export async function getContents(pdfPath) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    let contents = null;

    // console.log(form);
    // console.log(fields);

    for (const field of fields) {
        // Kiểm tra xem field có phải là Signature (chữ ký) không
        const acroField = field.acroField;
        const type = acroField.dict.get(PDFName.of('FT'));
        if (type !== PDFName.of('Sig')) {
            continue; // Bỏ qua nếu không phải trường chữ ký
        }

        // lấy nội dung trong contents (bao gồm certificate và chữ ký dưới dạng hex của ASN.1 code)
        contents = acroField.V().get(PDFName.of('Contents'));
        console.log(type);
        console.log("\n \n");
        // console.log(contents);
        console.log("\n \n");
        console.log(contents);
    }
    // throw new Error("Không tìm thấy trường chữ ký hoặc ByteRange trong file PDF.");
    return contents.value;
}

// Chạy thử
getContents('./test/test.pdf')
    .then(contents => console.log("Contents của bạn là:", contents))
    .catch(err => console.error("Lỗi:", err.message));


export default getContents;