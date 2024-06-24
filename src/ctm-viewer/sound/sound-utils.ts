export function int16ArrayFlatten(chunks: Int16Array[]) {
    const totalFrames = chunks.reduce((acc, elem) => acc + elem.length, 0)
    const result = new Int16Array(totalFrames);

    let currentFrame = 0;
    chunks.forEach((chunk) => {
        result.set(chunk, currentFrame)
        currentFrame += chunk.length;
    });

    return result;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const length = bytes.byteLength;
    for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
