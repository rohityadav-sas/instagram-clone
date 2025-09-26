import { useState } from "react"
import Image from "next/image"
import { UserCircle2, Send } from "lucide-react"
import { useOnlineUsersStore, useUserStore } from "@/store/store"

// Mock users
const mockUsers = [
	{
		_id: "user-1",
		username: "john_doe",
		profile_picture: "/default-avatar.svg",
		isOnline: true,
	},
	{
		_id: "user-2",
		username: "emma_wilson",
		profile_picture: "/default-avatar.svg",
		isOnline: false,
	},
]

// Mock chats (Chat docs)
const mockChats = [
	{
		_id: "chat-1",
		members: ["user-1", "user-2"],
		last_message: "msg-2",
		updatedAt: "2024-09-25T14:32:00Z",
	},
]

// Mock messages (Message docs)
const mockMessages = [
	{
		_id: "msg-1",
		sender: "user-1",
		chat: "chat-1",
		message: "Hey! How was your trip?",
		read_by: ["user-1"],
		createdAt: "2024-09-25T14:30:00Z",
	},
	{
		_id: "msg-2",
		sender: "user-2",
		chat: "chat-1",
		message: "It was amazing! The sunset views were incredible 🌅",
		read_by: ["user-1", "user-2"],
		createdAt: "2024-09-25T14:32:00Z",
	},
]

const MessagesComponent = () => {
	const [selectedChat, setSelectedChat] = useState(mockChats[0])
	const [newMessage, setNewMessage] = useState("")

	const currentUser = useUserStore((state) => state.username)

	const onlineUsers = useOnlineUsersStore((state) => state.onlineUsers)
	const following = useOnlineUsersStore((state) => state.following)
	const followers = useOnlineUsersStore((state) => state.followers)

	console.log("Online Users from store: ", onlineUsers)
	console.log("Following: ", following)
	console.log("Followers: ", followers)

	const conversations = mockChats.map((chat) => {
		const otherUserId = chat.members.find((id) => id !== currentUser)!
		const otherUser = mockUsers.find((u) => u._id === otherUserId)!
		const lastMessage = mockMessages.find((m) => m._id === chat.last_message)

		return {
			...chat,
			otherUser,
			lastMessage,
		}
	})

	// Get messages for selected chat
	const chatMessages = mockMessages
		.filter((m) => m.chat === selectedChat._id)
		.map((m) => ({
			...m,
			isOwnMessage: m.sender === currentUser,
		}))

	// Send new message
	const sendMessage = () => {
		if (newMessage.trim()) {
			console.log("Sending message:", newMessage)
			// Normally you'd push to DB + socket here
			setNewMessage("")
		}
	}

	return (
		<div className="flex-1 flex">
			{/* Conversations List */}
			<div className="w-80 border-r border-gray-200 flex flex-col">
				{/* Header */}
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold">Chats</h2>
				</div>

				{/* Conversations */}
				<div className="flex-1 overflow-y-auto">
					{conversations.map((conv) => (
						<div
							key={conv._id}
							onClick={() => setSelectedChat(conv)}
							className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
								selectedChat._id === conv._id ? "bg-gray-100" : ""
							}`}
						>
							{/* Avatar */}
							<div className="relative">
								{conv.otherUser.profile_picture ? (
									<Image
										src={conv.otherUser.profile_picture}
										alt={conv.otherUser.username}
										width={48}
										height={48}
										className="rounded-full object-cover"
									/>
								) : (
									<UserCircle2 className="w-12 h-12 text-gray-400" />
								)}
								{conv.otherUser.isOnline && (
									<div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
								)}
							</div>

							{/* Info */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between">
									<p className="font-semibold text-sm truncate">
										{conv.otherUser.username}
									</p>
									<span className="text-xs text-gray-500">2m</span>
								</div>
								<div className="flex items-center justify-between">
									<p
										className={`text-sm truncate ${
											conv.lastMessage
												? "text-gray-900"
												: "text-gray-500 italic"
										}`}
									>
										{conv.lastMessage?.message || "No messages yet"}
									</p>
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
					{(() => {
						const otherUserId = selectedChat.members.find(
							(id) => id !== currentUser
						)!
						const otherUser = mockUsers.find((u) => u._id === otherUserId)!
						return (
							<>
								{otherUser.profile_picture ? (
									<Image
										src={otherUser.profile_picture}
										alt={otherUser.username}
										width={40}
										height={40}
										className="rounded-full object-cover"
									/>
								) : (
									<UserCircle2 className="w-10 h-10 text-gray-400" />
								)}
								<div>
									<p className="font-semibold">{otherUser.username}</p>
									<p className="text-xs text-gray-500">
										{otherUser.isOnline ? "Active now" : "Offline"}
									</p>
								</div>
							</>
						)
					})()}
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{chatMessages.map((message) => (
						<div
							key={message._id}
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
								<p className="text-sm">{message.message}</p>
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
