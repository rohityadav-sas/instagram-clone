"use client"
import Sidebar from "@/components/Sidebar"
import Feed from "@/components/Feed"
import Suggestions from "@/components/Suggestions"

export default function Home() {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<Feed />
			<Suggestions />
		</div>
	)
}
