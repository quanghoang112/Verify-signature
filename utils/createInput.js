import { buildPoseidon } from 'circomlibjs';
import fs from 'fs';

async function runPoseidonWorkflow() {
    // 1. Khởi tạo Poseidon
    const poseidon = await buildPoseidon();
    const F = poseidon.F;

    // 2. Chuẩn bị dữ liệu (128 bit = 16 bytes)
    // Bạn có thể thay thế dòng này bằng fs.readFileSync('extracted_data.bin').subarray(0, 16)
    // const buffer = Buffer.from("0123456789ABCDEF0123456789ABCDEF", "hex").subarray(0, 14);
    // const buffer = fs.readFileSync('extracted_data.bin').subarray(0, 31*20);
    const buffer = fs.readFileSync('extracted_data.bin');
    console.log(`Độ dài dữ liệu: ${buffer.length/31}`);

    // 3. Chia nhỏ dữ liệu thành các Chunks (chunks 8*31-bit)
    let inputs = [BigInt("0x" + buffer.subarray(0, buffer.length < 31 ? buffer.length : 31).toString("hex"))];
    for (let i = 1; i < Math.floor(buffer.length / 31); i++) {
        inputs.push(BigInt("0x" + buffer.subarray(i * 31, (i + 1) * 31).toString("hex")));
    }
    let final = buffer.length % 31 ==0 ? 0 : inputs.push(BigInt("0x" + buffer.subarray(Math.floor(buffer.length / 31)*31, buffer.length).toString("hex")));
    console.log(`final: ${final}`);
    console.log(`inputs: ${inputs.slice(0,10).map(i => "0x"+ i.toString(16))}`);
    // 4. Tính toán Hash Poseidon
    // const hashResult = poseidon(inputs);
    let hashResult=0;
    let tmp=inputs;
    let layer=0;
    while (1)
    {
        layer++;
        console.log(`--- Layer ${layer} ---`);
        let tmp2=[];
        if (tmp.length<=16)
        {
            const tmpResult = poseidon(tmp);
            hashResult = tmpResult;
            break;
        }
        else
        {
            for (let i = 0; i < Math.floor(tmp.length / 16); i++) {
                const chunk = tmp.slice(i * 16, (i + 1) * 16);
                const hashChunk = poseidon(chunk);
                tmp2.push(hashChunk);
            }
            const tmpResult = tmp.length % 16 == 0 ? 0 : tmp2.push(poseidon(tmp.slice(Math.floor(tmp.length / 16)*16, tmp.length)));
            console.log("tmp2 length: ", tmp2.length);
            tmp=tmp2;
        }
    }
    
    // Định dạng kết quả
    const hashHex = "0x" + F.toString(hashResult, 16);
    const hashDecimal = F.toString(hashResult, 10);

    // 5. Tổng hợp dữ liệu kiểm tra (Debug Object)
    const debugData = {
        timestamp: new Date().toISOString(),
        metadata: {
            bits: 128,
            chunks: inputs.length
        },
        input_mess: {
            decimal: inputs.map(i => i.toString()),
            hex: inputs.map(i => "0x" + i.toString(16))
        },
        output_hash: {
            hex: hashHex,
            decimal: hashDecimal
        }
    };

    // 6. In kết quả ra Console
    console.log("--- POSEIDON TEST RESULT ---");
    console.log("Inputs (Hex):", debugData.input_mess.hex);
    console.log("Hash (Hex):  ", hashHex);
    console.log("Hash (Dec):  ", hashDecimal);

    // 7. Lưu vào file JSON
    fs.writeFileSync('debug_poseidon.json', JSON.stringify(debugData, null, 4));
    
    // Tạo thêm file input.json dùng trực tiếp cho Circom
    const circomInput = {
        "in": debugData.input_mess.decimal,
        "expectedHash": debugData.output_hash.decimal
    };
    fs.writeFileSync('input.json', JSON.stringify(circomInput, null, 4));

    console.log("\n✅ Đã lưu file debug_poseidon.json và input.json");
}


async function runPoseidonWorkflowSponge() {
    // 1. Khởi tạo Poseidon
    const poseidon = await buildPoseidon();
    const F = poseidon.F;

    // 2. Chuẩn bị dữ liệu (128 bit = 16 bytes)
    // Bạn có thể thay thế dòng này bằng fs.readFileSync('extracted_data.bin').subarray(0, 16)
    // const buffer = Buffer.from("0123456789ABCDEF0123456789ABCDEF", "hex").subarray(0, 14);
    // const buffer = fs.readFileSync('extracted_data.bin').subarray(0, 31*20);
    const buffer = fs.readFileSync('extracted_data.bin');
    console.log(`Độ dài dữ liệu: ${buffer.length/31}`);

    // 3. Chia nhỏ dữ liệu thành các Chunks (chunks 8*31-bit)
    let inputs = [BigInt("0x" + buffer.subarray(0, buffer.length < 31 ? buffer.length : 31).toString("hex"))];
    for (let i = 1; i < Math.floor(buffer.length / 31); i++) {
        inputs.push(BigInt("0x" + buffer.subarray(i * 31, (i + 1) * 31).toString("hex")));
    }
    let final = buffer.length % 31 ==0 ? 0 : inputs.push(BigInt("0x" + buffer.subarray(Math.floor(buffer.length / 31)*31, buffer.length).toString("hex")));
    console.log(`final: ${final}`);
    console.log(`inputs: ${inputs.slice(0,10).map(i => "0x"+ i.toString(16))}`);
    // Padding để độ dài inputs
    while (inputs.length % 15 != 1) {
        inputs.push(BigInt(0));
    }

    console.log(`Padded inputs length: ${inputs.length}`);
    // 4. Tính toán Hash Poseidon
    // const hashResult = poseidon(inputs);
    let hashResult=0;
    let tmp=[...inputs];
    let lenTmp=Math.floor(tmp.length/15);
    for (let i = 0; i < lenTmp; i ++) {
        console.log(`--- Round ${i+1} ---`);
        const chunk = tmp.slice(0,16);
        const hashChunk = poseidon(chunk);
        tmp.splice(0,16,hashChunk);
    }
    hashResult = tmp[0];    
    // Định dạng kết quả
    const hashHex = "0x" + F.toString(hashResult, 16);
    const hashDecimal = F.toString(hashResult, 10);

    // 5. Tổng hợp dữ liệu kiểm tra (Debug Object)
    const debugData = {
        timestamp: new Date().toISOString(),
        metadata: {
            bits: 128,
            chunks: inputs.length
        },
        input_mess: {
            decimal: inputs.map(i => i.toString()),
            hex: inputs.map(i => "0x" + i.toString(16))
        },
        output_hash: {
            hex: hashHex,
            decimal: hashDecimal
        }
    };

    // 6. In kết quả ra Console
    console.log("--- POSEIDON TEST RESULT ---");
    console.log("Inputs (Hex):", debugData.input_mess.hex);
    console.log("Hash (Hex):  ", hashHex);
    console.log("Hash (Dec):  ", hashDecimal);

    // 7. Lưu vào file JSON
    fs.writeFileSync('debug_poseidon.json', JSON.stringify(debugData, null, 4));
    
    // Tạo thêm file input.json dùng trực tiếp cho Circom
    const circomInput = {
        "in": debugData.input_mess.decimal,
        "expectedHash": debugData.output_hash.decimal
    };
    fs.writeFileSync('input.json', JSON.stringify(circomInput, null, 4));

    console.log("\n✅ Đã lưu file debug_poseidon.json và input.json");
}

// runPoseidonWorkflow().catch(console.error);

runPoseidonWorkflowSponge().catch(console.error);