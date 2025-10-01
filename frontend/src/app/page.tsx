"use client"
import Sidebar from "@/components/Sidebar"
import Feed from "@/components/Feed"
import Suggestions from "@/components/Suggestions"
import axios_instance from "@/config/axios"
import { useEffect } from "react"
import { useUserStore } from "@/store/store"

export default function Home() {
	const setUser = useUserStore((state) => state.setUser)
	useEffect(() => {
		axios_instance.get("/users/me").then((response) => {
			setUser(response.data.data)
		})
	}, [])
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<Feed />
			<Suggestions />
		</div>
	)
}
