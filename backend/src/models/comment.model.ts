import { model, Schema } from "mongoose"

const comment_schema = new Schema(
	{
		text: { type: String, required: true },
		author: { type: Schema.Types.ObjectId, ref: "User", required: true },
		post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
		likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
	},
	{ timestamps: true }
)

comment_schema.index({ post: 1, createdAt: -1 })

const Comment = model("Comment", comment_schema)
export default Comment
