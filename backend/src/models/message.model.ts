import { model, Schema } from "mongoose"

const message_schema = new Schema(
	{
		sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
		chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
		message: { type: String, required: true },
		read_by: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
	},
	{ timestamps: true }
)

// Pre-save hook to add sender to read_by automatically
message_schema.pre("save", function (next) {
	if (!this.read_by.includes(this.sender)) this.read_by.push(this.sender)
	next()
})

message_schema.index({ chat: 1, createdAt: -1 })

const Message = model("Message", message_schema)

export default Message
