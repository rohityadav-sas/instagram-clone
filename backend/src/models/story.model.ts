import { model, Schema } from "mongoose"

const story_schema = new Schema(
	{
		image: { type: String, required: true },
		image_public_id: { type: String, required: true },
		author: { type: Schema.Types.ObjectId, ref: "User", required: true },
		viewers: [{ type: Schema.Types.ObjectId, ref: "User" }],
		expiresAt: {
			type: Date,
			default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
		},
	},
	{ timestamps: true }
)

story_schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

story_schema.index({ author: 1, createdAt: -1 })

const Story = model("Story", story_schema)
export default Story
