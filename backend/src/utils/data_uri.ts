import "multer"
import sharp from "sharp"

export const get_data_uri = async (file: Express.Multer.File) => {
	const compressed = await sharp(file.buffer)
		.resize(1080)
		.jpeg({ quality: 80 })
		.toBuffer()
	return `data:${file.mimetype};base64,${compressed.toString("base64")}`
}
