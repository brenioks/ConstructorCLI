function decodeFeatureFlags(encodedFlags) {
	const bytes = Buffer.from(encodedFlags, "base64");
	for (const [i, byte] of bytes.entries()) {
		bytes[i] = byte - 10;
	}
	return bytes.toString();
}

const defaultFfeFromIdeOutput = "cXc3a39+cjd2eXFzeDZ3e35+Nmt/bnN5N3CCNnl6b3xrcYI3g4NtNnN4fm92dnN9b3h9bzZ4f3Z2c31yNnZ5cXN4aX19eTZ+b31+Nm1/fX55d2lveIA2cHN2fjVwgjZxgml3eW5pgWt2dnprem98NnGCaXd5bmlxa3dvfX58c3o2dnOAb2mBa3Z2emt6b3xpfX9sfW18c3p+c3l4Nm15bm83b25zfnl8Nn1+fHN6aX94f31vbmlrfX1vfn02f3pua35vN3p8eW1vfX02emttdWtxbzd3a3hrcW98Nnp8b3BrbDd2c2x8a3yDNn2AcTZ8b25uc342bXx5eH99"
const result = decodeFeatureFlags(defaultFfeFromIdeOutput);

console.log("Decoding: " + defaultFfeFromIdeOutput);
console.log("Result:\n\t" + result.split(",").map((s) => `"${s}"`).join(",\n\t"))
process.exit(0);