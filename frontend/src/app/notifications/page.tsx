"use client"
import Sidebar from "@/components/Sidebar"
import NotificationsComponent from "@/components/Notification"

export default function NotificationsPage() {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<NotificationsComponent />
		</div>
	)
}
