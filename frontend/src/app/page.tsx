"use client"
import Sidebar from "@/components/Sidebar"
import Feed from "@/components/Feed"
import Suggestions from "@/components/Suggestions"
import axios_instance from "@/config/axios"
import { useEffect } from "react"
import { useUserStore } from "@/store/store"
import { useSearchParams } from "next/navigation"

export default function Home() {
	const setUser = useUserStore((state) => state.setUser)
	const searchParams = useSearchParams()
	useEffect(() => {
		const authToken = searchParams.get("authToken")
		if (authToken) {
			localStorage.setItem("bearer_token", authToken)
			window.history.replaceState({}, "", "/")
			axios_instance.get("/users/me").then((response) => {
				setUser(response.data.data)
			})
		} else {
			axios_instance.get("/users/me").then((response) => {
				setUser(response.data.data)
			})
		}
	}, [])
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<Feed />
			<Suggestions />
		</div>
	)
}
