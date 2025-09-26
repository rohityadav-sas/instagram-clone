import { model, Schema } from "mongoose"

const chat_schema = new Schema(
	{
		members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
		last_message: {
			type: Schema.Types.ObjectId,
			ref: "Message",
			default: null,
		},
	},
	{ timestamps: true }
)

chat_schema.index({ members: 1 })

const Chat = model("Chat", chat_schema)

export default Chat
