import { model, Schema } from "mongoose"

const post_schema = new Schema(
	{
		caption: { type: String, default: "" },
		image: { type: String, required: true },
		image_public_id: { type: String, required: true },
		author: { type: Schema.Types.ObjectId, ref: "User", required: true },
		likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
	},
	{ timestamps: true }
)

post_schema.index({ author: 1, createdAt: -1 })

const Post = model("Post", post_schema)
export default Post
