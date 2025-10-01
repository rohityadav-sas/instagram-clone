import { model, Schema } from "mongoose"

const user_schema = new Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		image: { type: String, default: "" },
		bio: { type: String, default: "" },
		gender: { type: String, default: "" },
		emailVerified: { type: Boolean, default: false },
		followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
		following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
		bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post", default: [] }],
		blocked_users: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
	},
	{ timestamps: true, collection: "user" }
)

const User = model("User", user_schema)

export default User
