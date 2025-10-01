"use client"
import { useEffect } from "react"
import { io } from "socket.io-client"
import {
	useUserStore,
	useSocketStore,
	useOnlineUsersStore,
} from "@/store/store"

export default function SocketInitializer({
	children,
}: {
	children: React.ReactNode
}) {
	const username = useUserStore((state) => state.username)
	const setSocket = useSocketStore((state) => state.setSocket)
	const setOnlineUsers = useOnlineUsersStore((state) => state.setOnlineUsers)
	useEffect(() => {
		if (!username) return
		const socket = io(process.env.NEXT_PUBLIC_API_URL, {
			transports: ["websocket"],
			withCredentials: true,
		})
		socket.on("onlineUsers", setOnlineUsers)

		setSocket(socket)

		return () => {
			socket.disconnect()
			setSocket(null)
		}
	}, [username, setSocket, setOnlineUsers])

	return <>{children}</>
}
