import sharp from "sharp";
import path from "path";
import fs from "fs";

export async function processPrivateAreaImage(
    buffer: Buffer,
    areaId: string
) {
    const uploadDir = path.join("uploads", "private-areas");

    // ✅ ensure directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const outputPath = path.join(uploadDir, `${areaId}.webp`);

    await sharp(buffer)
        .resize({ width: 800 }) // optional
        .webp({ quality: 80 })
        .toFile(outputPath);

    return `/uploads/private-areas/${areaId}.webp`;
}
