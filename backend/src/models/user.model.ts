import { model, Schema } from "mongoose"

const user_schema = new Schema(
	{
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		profile_picture: { type: String, default: "" },
		bio: { type: String, default: "" },
		gender: { type: String, default: "" },
		isVerified: { type: Boolean, default: false },
		followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
		following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
		bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post", default: [] }],
		blocked_users: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
	},
	{ timestamps: true }
)

const User = model("User", user_schema)

export default User
