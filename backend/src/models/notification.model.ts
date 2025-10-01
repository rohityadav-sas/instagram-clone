import { model, Schema } from "mongoose"
import { io } from "../server.js"
import { online_users } from "../socket/socket.js"
import User from "./user.model.js"

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
		comment: { type: String },
		isRead: { type: Boolean, default: false },
		isFollowing: { type: Boolean, default: false },
	},
	{ timestamps: true }
)

notification_schema.index(
	{ type: 1, from: 1, to: 1, post: 1 },
	{
		unique: true,
		partialFilterExpression: { type: { $in: ["like", "follow"] } },
	}
)

notification_schema.post("save", async function (doc) {
	try {
		const notificationDetails = await doc.populate([
			{ path: "from", select: "username image" },
			{ path: "to", select: "username" },
			{ path: "post", select: "image" },
		])
		const isFollowing = Boolean(
			await User.exists({
				_id: doc.to._id,
				following: doc.from._id,
			})
		)
		const receiverSocketId = online_users.get(doc.to._id.toString())
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("notification", {
				notificationDetails,
				isFollowing,
			})
		}
	} catch (err) {
		console.error("Error sending notification", err)
	}
})

export default model("Notification", notification_schema)
