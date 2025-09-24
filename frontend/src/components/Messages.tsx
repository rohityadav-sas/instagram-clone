import { useState } from "react"
import Image from "next/image"
import { UserCircle2, Send } from "lucide-react"
import { useUserStore } from "@/store/store"

// Temporary mock data until real API integration
const mockConversations = [
	{
		id: "conv-1",
		user: {
			username: "john_doe",
			profile_picture: "/default-avatar.svg",
		},
		lastMessage: "Hey! How was your trip?",
		timestamp: "2m",
		unread: true,
		isOnline: true,
	},
	{
		id: "conv-2",
		user: {
			username: "emma_wilson",
			profile_picture: "/default-avatar.svg",
		},
		lastMessage: "Thanks for the recommendation!",
		timestamp: "1h",
		unread: false,
		isOnline: false,
	},
]

const mockMessages = [
	{
		id: "msg-1",
		text: "Hey! How was your trip?",
		timestamp: "2:30 PM",
		isOwnMessage: false,
	},
	{
		id: "msg-2",
		text: "It was amazing! The sunset views were incredible 🌅",
		timestamp: "2:32 PM",
		isOwnMessage: true,
	},
]

const MessagesComponent = () => {
	const user = useUserStore((state) => state)
	const [selectedConversation, setSelectedConversation] = useState(
		mockConversations[0]
	)
	const [newMessage, setNewMessage] = useState("")

	const sendMessage = () => {
		if (newMessage.trim()) {
			console.log("Sending message:", newMessage)
			setNewMessage("")
		}
	}

	return (
		<div className="flex-1 flex">
			{/* Conversations List */}
			<div className="w-80 border-r border-gray-200 flex flex-col">
				{/* Header */}
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold">{user.username}</h2>
				</div>

				{/* Conversations */}
				<div className="flex-1 overflow-y-auto">
					{mockConversations.map((conversation) => (
						<div
							key={conversation.id}
							onClick={() => setSelectedConversation(conversation)}
							className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
								selectedConversation.id === conversation.id ? "bg-gray-100" : ""
							}`}
						>
							<div className="relative">
								{conversation.user.profile_picture ? (
									<Image
										src={conversation.user.profile_picture}
										alt={conversation.user.username}
										width={48}
										height={48}
										className="rounded-full object-cover"
									/>
								) : (
									<UserCircle2 className="w-12 h-12 text-gray-400" />
								)}
								{conversation.isOnline && (
									<div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between">
									<p className="font-semibold text-sm truncate">
										{conversation.user.username}
									</p>
									<span className="text-xs text-gray-500">
										{conversation.timestamp}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<p
										className={`text-sm truncate ${
											conversation.unread
												? "font-medium text-gray-900"
												: "text-gray-500"
										}`}
									>
										{conversation.lastMessage}
									</p>
									{conversation.unread && (
										<div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Chat Area */}
			<div className="flex-1 flex flex-col">
				{/* Chat Header */}
				<div className="p-4 border-b border-gray-200 flex items-center gap-3">
					{selectedConversation.user.profile_picture ? (
						<Image
							src={selectedConversation.user.profile_picture}
							alt={selectedConversation.user.username}
							width={40}
							height={40}
							className="rounded-full object-cover"
						/>
					) : (
						<UserCircle2 className="w-10 h-10 text-gray-400" />
					)}
					<div>
						<p className="font-semibold">
							{selectedConversation.user.username}
						</p>
						<p className="text-xs text-gray-500">
							{selectedConversation.isOnline ? "Active now" : "Active 2h ago"}
						</p>
					</div>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{mockMessages.map((message) => (
						<div
							key={message.id}
							className={`flex ${
								message.isOwnMessage ? "justify-end" : "justify-start"
							}`}
						>
							<div
								className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
									message.isOwnMessage
										? "bg-blue-500 text-white"
										: "bg-gray-200 text-gray-900"
								}`}
							>
								<p className="text-sm">{message.text}</p>
							</div>
						</div>
					))}
				</div>

				{/* Message Input */}
				<div className="p-4 border-t border-gray-200">
					<div className="flex items-center gap-3">
						<input
							type="text"
							placeholder="Message..."
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && sendMessage()}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						<button
							onClick={sendMessage}
							disabled={!newMessage.trim()}
							className="text-blue-500 hover:text-blue-700 disabled:text-gray-300 transition-colors"
						>
							<Send className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default MessagesComponent
