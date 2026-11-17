// Blob downloads may be chunked or decompressed, so Content-Length is not a
// reliable upload size. Enforce the limit while reading the actual bytes.
export async function readUpload(stream: ReadableStream<Uint8Array>, maximumSizeInBytes: number) {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximumSizeInBytes) throw new Error("This file exceeds the upload size limit.");
      chunks.push(Buffer.from(value));
    }
    if (!size) throw new Error("Choose a non-empty file.");
    return Buffer.concat(chunks, size);
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
}
