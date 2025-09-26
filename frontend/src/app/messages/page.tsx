"use client"
import Sidebar from "@/components/Sidebar"
import MessagesComponent from "@/components/Messages"
import { useEffect } from "react"
import { io } from "socket.io-client"
import { useOnlineUsersStore, useUserStore } from "@/store/store"
import axios_instance from "@/config/axios"

export default function MessagesPage() {
	const username = useUserStore((state) => state.username)
	const setOnlineUsers = useOnlineUsersStore((state) => state.setOnlineUsers)
	const setFollowing = useOnlineUsersStore((state) => state.setFollowing)
	const setFollowers = useOnlineUsersStore((state) => state.setFollowers)
	useEffect(() => {
		if (!username) return
		const socket = io(
			`${process.env.NEXT_PUBLIC_API_URL?.replace("api", "")}`,
			{
				query: {
					userId: username,
				},
				transports: ["websocket"],
			}
		)
		socket.on("onlineUsers", (data) => {
			setOnlineUsers(data)
			console.log("Online Users: ", data)
		})
		return () => {
			socket.disconnect()
		}
	}, [username])

	useEffect(() => {
		if (!username) return

		const fetchData = async () => {
			try {
				const [following, followers] = await Promise.all([
					axios_instance.get("/users/" + username + "/following"),
					axios_instance.get("/users/" + username + "/followers"),
				])
				if (following.data.success) setFollowing(following.data.data)
				if (followers.data.success) setFollowers(followers.data.data)
			} catch (err) {
				console.error("Failed to fetch following/followers", err)
			}
		}

		fetchData()
	}, [username])

	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<MessagesComponent />
		</div>
	)
}
