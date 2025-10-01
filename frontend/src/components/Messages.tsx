import { useEffect, useState } from "react"
import { CheckCircle, MessageCircleCode, SendIcon } from "lucide-react"
import { motion } from "framer-motion"
import {
	useLastMessagesStore,
	useOnlineUsersStore,
	useSocketStore,
	useUserStore,
} from "@/store/store"
import Image from "next/image"
import { Input } from "./ui/input"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"
import { Message } from "@/types/message"
import ChatMessages from "@/components/ChatMessages"
import { type existingChat } from "@/types/conversation"

const TypingIndicator = () => {
	return (
		<div className="flex gap-1 items-center text-gray-500 text-sm px-6 py-2 h-10 w-20 ml-4 bg-gray-300 rounded-2xl rounded-bl-none mt-2 mb-2">
			<motion.span
				animate={{ y: [0, -3, 0] }}
				transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
				className="size-2 bg-gray-400 rounded-full"
			/>
			<motion.span
				animate={{ y: [0, -3, 0] }}
				transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
				className="size-2 bg-gray-400 rounded-full"
			/>
			<motion.span
				animate={{ y: [0, -3, 0] }}
				transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
				className="size-2 bg-gray-400 rounded-full"
			/>
		</div>
	)
}

const MessagesComponent = () => {
	const socket = useSocketStore((state) => state.socket)
	const currentUserId = useUserStore((state) => state._id)
	const queryClient = useQueryClient()
	const onlineUsers = useOnlineUsersStore((state) => state.onlineUsers)
	const [newMessage, setNewMessage] = useState<string>("")
	const [typing, setTyping] = useState<boolean>(false)

	const [selectedChat, setSelectedChat] = useState<existingChat | null>(null)
	const conversations = useLastMessagesStore((state) => state.lastMessages)

	const messages = useQuery<Message[]>({
		queryKey: ["chats", selectedChat?.members[0]._id],
		queryFn: async () => {
			const { data } = await axios_instance.get(
				`/messages/${selectedChat?.members[0]._id}`
			)
			if (!data.success) return []
			return data.data
		},
		enabled: !!selectedChat,
	})

	useEffect(() => {
		queryClient.refetchQueries({ queryKey: ["lastMessages"] })
	}, [selectedChat, queryClient])

	useEffect(() => {
		if (!socket) return
		socket.on("newMessage", (msg: Message) => {
			if (msg.sender === selectedChat?.members[0]._id) {
				queryClient.refetchQueries({
					queryKey: ["chats", selectedChat?.members[0]._id],
				})
			}
			queryClient.refetchQueries({ queryKey: ["lastMessages"] })
			if (
				selectedChat &&
				msg.chat === selectedChat._id &&
				!msg.read_by.includes(currentUserId)
			) {
				socket.emit(
					"messagesRead",
					{ chatId: selectedChat._id, messageIds: [msg._id] },
					(response: { success: boolean }) => {
						if (response.success) {
							queryClient.refetchQueries({
								queryKey: ["chats", selectedChat?.members[0]._id],
							})
						}
					}
				)
			}
		})

		socket.on(
			"messagesRead",
			({ chatId }: { chatId: string; readerId: string }) => {
				if (chatId === selectedChat?._id) {
					queryClient.refetchQueries({
						queryKey: ["chats", selectedChat?.members[0]._id],
					})
					queryClient.refetchQueries({ queryKey: ["lastMessages"] })
				}
			}
		)
		let typingTimeout: NodeJS.Timeout

		socket.on("typing", ({ sender }: { sender: string }) => {
			if (selectedChat?.members[0]._id === sender) {
				setTyping(true)
				clearTimeout(typingTimeout)
				typingTimeout = setTimeout(() => {
					setTyping(false)
				}, 1500)
			}
		})
		return () => {
			socket.off("newMessage")
			socket.off("messagesRead")
			socket.off("typing")
			clearTimeout(typingTimeout)
		}
	}, [socket, selectedChat, queryClient, currentUserId])

	useEffect(() => {
		if (!socket || !selectedChat || !messages.data) return

		// Find messages not yet read by current user
		const unreadMessageIds = messages.data
			.filter((msg) => !msg.read_by.includes(currentUserId))
			.map((msg) => msg._id)

		if (unreadMessageIds.length === 0) return
		// Emit to backend
		socket.emit(
			"messagesRead",
			{ chatId: selectedChat._id, messageIds: unreadMessageIds },
			(_response: { success: boolean }) => {}
		)
	}, [socket, selectedChat, messages.data, currentUserId, queryClient])

	const sendMessage = async () => {
		if (!newMessage.trim() || !selectedChat) return
		queryClient.setQueryData<Message[]>(
			["chats", selectedChat?.members[0]._id],
			(old = []) => [
				{
					_id: `temp-${Date.now()}`,
					sender: currentUserId,
					message: newMessage.trim(),
					createdAt: new Date().toISOString(),
					read_by: [currentUserId],
				},
				...old,
			]
		)
		const oldMessageCopy = newMessage
		setNewMessage("")
		try {
			socket?.emit(
				"sendMessage",
				{
					receiver: selectedChat?.members[0]._id,
					content: newMessage.trim(),
				},
				(response: { success: boolean; message: string; data: any }) => {
					if (!response.success) {
						setNewMessage(oldMessageCopy)
						queryClient.setQueryData<Message[]>(
							["chats", selectedChat?.members[0]._id],
							(old = []) =>
								old.filter((msg) => msg._id !== `temp-${oldMessageCopy}`)
						)
						toast.error("Failed to send message on server side")
					}
				}
			)
		} catch (err) {
			setNewMessage(oldMessageCopy)
			queryClient.setQueryData<Message[]>(
				["chats", selectedChat?.members[0]._id],
				(old = []) => old.filter((msg) => msg._id !== `temp-${oldMessageCopy}`)
			)
			toast.error("Failed to send message on client side")
		}
	}

	return (
		<div className="flex flex-1">
			<div className="w-1/3 border-r overflow-y-auto">
				<h1 className="border-b p-4 text-center text-2xl font-semibold">
					Chats
				</h1>
				{conversations.existingChats &&
					conversations.existingChats.map((chat) => (
						<div
							key={chat._id}
							className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-100
		${selectedChat?._id === chat._id ? "bg-gray-100" : ""}
		${chat.unreadCount > 0 && selectedChat?._id !== chat._id ? "bg-blue-50" : ""}`}
							onClick={() => setSelectedChat(chat)}
						>
							<div className="flex mr-3 relative">
								<Image
									alt="Profile Picture"
									src={chat.members[0].image || "/default-avatar.svg"}
									width={50}
									height={50}
									style={{
										borderRadius: "50%",
										objectFit: "cover",
										aspectRatio: "1/1",
									}}
								/>
								{onlineUsers.includes(chat.members[0]._id) && (
									<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
								)}
							</div>
							<div className="flex flex-col w-full">
								<div className="font-medium flex items-center gap-1">
									<span>{chat.members[0].username}</span>
									{chat.members[0].emailVerified && (
										<CheckCircle className="text-blue-500" size={12} />
									)}
								</div>
								<div className="flex text-sm justify-between">
									<div className="text-gray-500">
										{chat?.last_message?.message}
									</div>
								</div>
							</div>
							<div className="flex flex-col items-end gap-2">
								{chat.unreadCount > 0 && (
									<div className="bg-blue-500 size-5 text-white text-xs font-semibold rounded-full flex justify-center items-center">
										{chat.unreadCount}
									</div>
								)}
								<div className="text-gray-500 text-xs text-nowrap">
									{new Date(chat.last_message?.createdAt).toLocaleTimeString(
										[],
										{
											hour: "2-digit",
											minute: "2-digit",
										}
									)}
								</div>
							</div>
						</div>
					))}
				{conversations.availableUsersForNewChat &&
					conversations.availableUsersForNewChat.map((user) => (
						<div
							key={user._id}
							className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-100
								${selectedChat?.members[0]._id === user._id ? "bg-gray-100" : ""}`}
							onClick={() =>
								setSelectedChat({
									_id: `temp-${user._id}`,
									members: [
										{
											_id: user._id,
											username: user.username,
											image: user.image,
											emailVerified: user.emailVerified,
										},
									],
									last_message: {
										_id: "",
										message: "",
										createdAt: "",
									},
									createdAt: "",
									unreadCount: 0,
								})
							}
						>
							<div className="flex mr-3 relative">
								<Image
									alt="Profile Picture"
									src={user.image || "/default-avatar.svg"}
									width={35}
									height={35}
									style={{
										borderRadius: "50%",
										objectFit: "cover",
										aspectRatio: "1/1",
									}}
								/>
								{onlineUsers.includes(user._id) && (
									<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
								)}
							</div>
							<div className="flex flex-col">
								<div className="font-medium flex items-center gap-1">
									<span>{user.username}</span>
									{user.emailVerified && (
										<CheckCircle className="text-blue-500" size={12} />
									)}
								</div>
								<div className="text-gray-500 text-sm">
									Start a conversation
								</div>
							</div>
						</div>
					))}
			</div>
			<div className="flex-1">
				{selectedChat ? (
					<div className="flex flex-col h-full">
						<div className="flex items-center h-20 px-4 border-b">
							<div className="flex mr-3 relative items-center gap-2">
								<Image
									alt="Profile Picture"
									src={selectedChat.members[0].image || "/default-avatar.svg"}
									width={40}
									height={40}
									style={{
										borderRadius: "50%",
										objectFit: "cover",
										aspectRatio: "1/1",
									}}
								/>
								<div className="flex flex-col text-lg font-semibold">
									<div
										className="flex gap-1 items-center cursor-pointer hover:underline"
										onClick={() => {
											window.location.href = `/${selectedChat.members[0].username}`
										}}
									>
										{selectedChat.members[0].username}
										{selectedChat.members[0].emailVerified && (
											<CheckCircle className="text-blue-500" size={12} />
										)}
									</div>
									<div className="font-normal text-gray-500 text-sm">
										{onlineUsers.includes(selectedChat.members[0]._id)
											? "Active now"
											: "Offline"}
									</div>
								</div>
							</div>
						</div>
						<ChatMessages
							messages={{
								data: messages.data,
								isLoading: messages.isLoading,
								isError: messages.isError,
							}}
							currentUserId={currentUserId}
						/>

						{selectedChat &&
							messages.data &&
							messages.data.length > 0 &&
							messages.data[0].sender === currentUserId && (
								<span className="text-gray-500 text-sm text-right px-8 mt-[-2px]">
									{(() => {
										return messages.data[0].read_by.includes(
											selectedChat.members[0]._id
										)
											? "✅ Seen"
											: "👁️‍🗨️ Unseen"
									})()}
								</span>
							)}

						{typing && <TypingIndicator />}
						<div className="h-20 border-t p-4 flex items-center gap-4">
							<Input
								placeholder="Type your message here..."
								className="h-12"
								value={newMessage}
								onChange={(e) => {
									setNewMessage(e.target.value)
									socket?.emit("typing", {
										receiver: selectedChat.members[0]._id,
									})
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault()
										sendMessage()
									}
								}}
							/>
							<motion.div whileTap={{ scale: 0.8 }}>
								<SendIcon className="cursor-pointer" onClick={sendMessage} />
							</motion.div>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center h-full justify-center text-gray-500 text-3xl gap-8">
						<MessageCircleCode className="mb-2" size={100} />
						Select a chat to start messaging
					</div>
				)}
			</div>
		</div>
	)
}

export default MessagesComponent
