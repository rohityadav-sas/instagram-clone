import mongoose from "mongoose"
import ENV from "../config/env.js"

export default async function connect_db() {
	try {
		if (!ENV.MONGODB_URI)
			throw new Error("MongoDB connection string is missing")
		await mongoose.connect(ENV.MONGODB_URI)
		console.log("Connected to MongoDB")
	} catch (error) {
		console.error("Error connecting to MongoDB:", error)
		process.exit(1)
	}
}
