import { model, Schema } from "mongoose"

const notification_schema = new Schema(
	{
		type: {
			type: String,
			enum: ["like", "comment", "follow"],
			required: true,
		},
		from: { type: Schema.Types.ObjectId, ref: "User", required: true },
		to: { type: Schema.Types.ObjectId, ref: "User", required: true },
		post: { type: Schema.Types.ObjectId, ref: "Post" },
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true }
)

notification_schema.index({ to: 1, isRead: 1, createdAt: -1 })

export default model("Notification", notification_schema)
