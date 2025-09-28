import axios_instance from "@/config/axios"
import { useLastMessagesStore, useSocketStore } from "@/store/store"
import { SidebarItemProps } from "@/types/sidebar"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

const SidebarItem = ({ icon, label, onClick, isActive }: SidebarItemProps) => {
	const socket = useSocketStore((state) => state.socket)
	const queryclient = useQueryClient()
	const setLastMessage = useLastMessagesStore((state) => state.setLastMessage)
	const { data: unreadCount } = useQuery({
		queryKey: ["notifications", "unread-count"],
		queryFn: async () => {
			const { data } = await axios_instance.get("/notifications/unread-count")
			return Number(data.count) || 0
		},
		enabled: label === "Notifications",
	})

	const { data: unreadChats } = useQuery<number>({
		queryKey: ["lastMessages"],
		queryFn: async () => {
			const { data } = await axios_instance.get("/messages/last")
			setLastMessage(data.data)
			const unread = data.data.existingChats.filter(
				(chat: any) => chat.unreadCount > 0
			)
			return unread.length
		},
		enabled: label === "Messages",
	})

	useEffect(() => {
		if (label === "Notifications" && socket) {
			const handler = () => {
				queryclient.refetchQueries({
					queryKey: ["notifications", "unread-count"],
				})
			}
			socket.on("notification", handler)

			return () => {
				socket.off("notification", handler)
			}
		}
		if (label === "Messages" && socket) {
			const messageHandler = () => {
				queryclient.refetchQueries({ queryKey: ["lastMessages"] })
			}
			socket.on("newMessage", messageHandler)

			return () => {
				socket.off("newMessage", messageHandler)
			}
		}
	}, [label, socket, queryclient])

	return (
		<button
			className={`flex gap-4 p-3 w-full cursor-pointer rounded-lg items-center transition-all duration-200 ${
				(label === "Notifications" && !!unreadCount && unreadCount > 0) ||
				(label === "Messages" && !!unreadChats && unreadChats > 0)
					? "bg-blue-100"
					: ""
			} ${
				isActive
					? "bg-gray-300 font-bold"
					: "hover:bg-gray-200 active:bg-gray-300"
			}`}
			onClick={onClick}
			type="button"
		>
			<span
				className={`w-6 h-6 flex items-center justify-center ${
					isActive ? "text-black" : "text-gray-700"
				}`}
			>
				{icon}
			</span>
			<span
				className={`text-base ${isActive ? "text-black" : "text-gray-900"}`}
			>
				{label}
			</span>
			{!!unreadCount && unreadCount > 0 && label === "Notifications" && (
				<span className="ml-auto min-w-[20px] h-5 px-2 bg-red-500 text-white text-xs font-semibold flex items-center justify-center rounded-full shadow-sm">
					{unreadCount > 99 ? "99+" : unreadCount}
				</span>
			)}
			{!!unreadChats && unreadChats > 0 && label === "Messages" && (
				<span className="ml-auto min-w-[20px] h-5 px-2 bg-red-500 text-white text-xs font-semibold flex items-center justify-center rounded-full shadow-sm">
					{unreadChats > 99 ? "99+" : unreadChats}
				</span>
			)}
		</button>
	)
}

export default SidebarItem
