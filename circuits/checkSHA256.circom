pragma circom 2.0.0;

include ".circomlib/circuits/sha256/sha256.circom";

template Sha256Check(n) {
    // Inputs
    signal input message[n];        // mảng bit của message
    signal input expectedHash[256]; // mảng bit của expected hash (sha256 output)
    
    // Outputs
    signal output result;

    // Hash message
    component hasher = Sha256(n);
    for (var i = 0; i < n; i++) {
        hasher.in[i] <== message[i];
    }

    // So sánh với expectedHash
    var isValid = 1;
    for (var j = 0; j < 256; j++) {
        isValid = isValid * (1 - (hasher.out[j] - expectedHash[j])*(hasher.out[j] - expectedHash[j]));
    }

    result <-- isValid;

    log(result);
}

component main{ public [expectedHash]} = Sha256Check(1024);