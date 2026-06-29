import sharp from "sharp";

export type ProcessImageOptions = {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
};

export type ProcessedImage = {
  buffer: Buffer;
  contentType: "image/webp";
  extension: "webp";
};

export async function processUploadImageToWebp(file: File, options: ProcessImageOptions): Promise<ProcessedImage> {
  const input = Buffer.from(await file.arrayBuffer());
  const quality = options.quality ?? 78;

  const buffer = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: options.maxWidth,
      height: options.maxHeight,
      fit: "inside",
      withoutEnlargement: true
    })
    .webp({ quality, effort: 4 })
    .toBuffer();

  return {
    buffer,
    contentType: "image/webp",
    extension: "webp"
  };
}
