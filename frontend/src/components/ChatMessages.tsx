import { Loader, MessageCircleCode } from "lucide-react"
import { type Message } from "@/types/message"

type Props = {
	messages: {
		isLoading: boolean
		isError: boolean
		data?: Message[]
	}
	currentUserId: string
}

const ChatMessages = ({ messages, currentUserId }: Props) => {
	if (messages.isLoading) {
		return (
			<p className="h-full flex items-center justify-center">
				<Loader className="size-8 animate-spin" />
			</p>
		)
	}

	if (messages.isError) {
		return (
			<p className="text-center text-red-400 text-3xl h-full flex items-center justify-center">
				Failed to load messages
			</p>
		)
	}

	return (
		<div className="flex-1 flex flex-col-reverse overflow-y-auto p-4 pb-0 gap-2 mb-3">
			{messages.data && messages.data?.length > 0 ? (
				messages.data.map((msg) => {
					const isOwn = msg.sender === currentUserId
					return (
						<div
							key={msg._id}
							className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`px-4 py-2 rounded-2xl max-w-xs lg:max-w-md text-sm ${
									isOwn
										? "bg-blue-500 text-white rounded-br-none"
										: "bg-gray-200 text-gray-900 rounded-bl-none"
								}`}
							>
								<p>{msg.message}</p>
								<div
									className={`text-[10px] mt-1 opacity-70 ${
										isOwn ? "text-right" : "text-left"
									}`}
								>
									{new Date(msg.createdAt).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</div>
							</div>
						</div>
					)
				})
			) : (
				<div className="flex flex-col items-center h-full justify-center text-gray-500 text-xl gap-8">
					<MessageCircleCode className="mb-2" size={100} />
					<div>Send a message to start the conversation!</div>
				</div>
			)}
		</div>
	)
}

export default ChatMessages
