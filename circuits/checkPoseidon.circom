pragma circom 2.0.0;

include "./circomlib/circuits/poseidon.circom";
include ".circomlib/circuits/comparators.circom";

template Division(n) {
    signal input dividend;
    signal input divisor;
    signal output quotient;
    signal output remainder;

    // 1. Tính toán giá trị
    quotient <-- dividend \ divisor; 
    remainder <-- dividend % divisor;

    // 2. Ràng buộc các giá trị để đảm bảo tính đúng đắn
    // Đảm bảo: dividend = divisor * quotient + remainder
    dividend === divisor * quotient + remainder;

    // 3. Ràng buộc quan trọng: Số dư phải nhỏ hơn Số chia
    // Sử dụng component so sánh (LessThan) để tránh gian lận
    component lt = LessThan(n);
    lt.in[0] <== remainder;
    lt.in[1] <== divisor;
    lt.out === 1;
}

template CheckHashing(n) {
    signal input in[n];
    signal input expectedHash;

    component hasher = Poseidon(n);
    hasher.inputs <== in;
    signal isEqual;
    component comparator = IsEqual();
    comparator.in[0] <== hasher.out;
    comparator.in[1] <== expectedHash;
    isEqual <== comparator.out;

    log("Computed Hash: ", hasher.out);
    log(isEqual);
    // Enforce that the computed hash matches the expected hash
    // isEqual === 1;
}

// Giả sử n = 256 (16 * 16), mạch sẽ có 2 tầng băm
template PoseidonTree3Layer() {
    signal input in[5763];
    signal input expectedHash;
    signal output out;

    // Tầng 1: n đầu vào -> 361 đầu ra (mỗi nhóm 16 băm 1 lần)
    component level1[361];
    for (var i = 0; i < 360; i++) {
        level1[i] = Poseidon(16);
        for (var j = 0; j < 16; j++) {
            level1[i].inputs[j] <== in[i * 16 + j];
        }
    }
    level1[360] = Poseidon(3);
    for (var j = 0; j < 3; j++) {
        level1[360].inputs[j] <== in[360 * 16 + j];
    }

    // Tầng 2: 361 đầu vào từ tầng 1 -> 23 đầu ra cuối cùng
    component level2[23];
    for (var i = 0; i < 22; i++) {
        level2[i] = Poseidon(16);
        for (var j = 0; j < 16; j++) {
            level2[i].inputs[j] <== level1[i * 16 + j].out;
        }
    }
    level2[22] = Poseidon(9);
    for (var j = 0; j < 9; j++) {
        level2[22].inputs[j] <== level1[22 * 16 + j].out;
    }

    // Tầng 3: 23 đầu vào từ tầng 2 -> 2 đầu ra cuối cùng
    component level3[2];
    for (var i = 0; i < 1; i++) {
        level3[i] = Poseidon(16);
        for (var j = 0; j < 16; j++) {
            level3[i].inputs[j] <== level2[i * 16 + j].out;
        }
    }
    level3[1] = Poseidon(7);
    for (var j = 0; j < 7; j++) {
        level3[1].inputs[j] <== level2[1 * 16 + j].out;
    }

    // Kết quả cuối cùng
    component level4 = Poseidon(2);
    level4.inputs[0] <== level3[0].out;
    level4.inputs[1] <== level3[1].out;
    out <== level4.out;
    log("Final Hash Output: ", out);

    // So sánh với expectedHash
    signal isEqual;
    component comparator = IsEqual();
    comparator.in[0] <== level4.out;
    comparator.in[1] <== expectedHash;
    isEqual <== comparator.out;
    log(isEqual);

}

template PoseidonSponge(n,loop)
{
    signal input in[ n ];
    signal input expectedHash;
    signal output out;

    // signal loop;
    // component div = Division(32);
    // div.dividend <== n;
    // div.divisor <== 15;
    // loop <== div.quotient;
    component hashers[ loop ];

    for (var i = 0; i <= loop; i++) {
        if ( i < loop )
        {
            hashers[i] = Poseidon(16);
        }
        if (i==0)
        {
            for (var j = 0; j < 16; j++) 
            {
               hashers[i].inputs[j] <== in[j];
            } 
        }
        else if (i == loop) 
        {
            out <== hashers[i-1].out;
        } else {
            hashers[i].inputs[0] <== hashers[i - 1].out;
            for (var j = 1; j < 16; j++) 
            {
                hashers[i].inputs[j] <== in[i * 15 + j];
            }
        }
    }
    log("Final Hash Output: ", out);
    // So sánh với expectedHash
    signal isEqual;
    component comparator = IsEqual();
    comparator.in[0] <== out;
    comparator.in[1] <== expectedHash;
    isEqual <== comparator.out;
    log(isEqual);
}
// component main = PoseidonTree3Layer();
component main = PoseidonSponge(5776,385);