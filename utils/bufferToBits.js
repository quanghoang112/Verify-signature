export function bufferToBits(buffer) {
  const bits = [];
  for (let byte of buffer) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }
  return bits;
}

export default bufferToBits;