"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/store"

export default function ProfilePage() {
	const router = useRouter()
	const currentUsername = useUserStore((state) => state.username)

	useEffect(() => {
		if (currentUsername) router.replace(`/${currentUsername}`)
	}, [currentUsername, router])

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-gray-500">Loading...</div>
		</div>
	)
}
