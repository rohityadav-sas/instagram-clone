"use client"
import Sidebar from "@/components/Sidebar"
import MessagesComponent from "@/components/Messages"

export default function MessagesPage() {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<MessagesComponent />
		</div>
	)
}
