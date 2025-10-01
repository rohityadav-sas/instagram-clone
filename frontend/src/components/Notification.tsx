"use client"
import { useEffect, useState } from "react"
import { Heart, Loader, MessageCircle, UserCircle2 } from "lucide-react"
import Image from "next/image"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios_instance from "@/config/axios"
import { useSocketStore } from "@/store/store"
import FollowButton from "./ui/FollowButton"
import toast from "react-hot-toast"

const NotificationsComponent = () => {
	const [filter, setFilter] = useState<"all" | "unread">("all")
	const queryclient = useQueryClient()
	const socket = useSocketStore((state) => state.socket)

	const { data: unreadCount } = useQuery({
		queryKey: ["notifications", "unread-count"],
		queryFn: async () => {
			const res = await axios_instance.get("/notifications/unread-count")
			return res.data.count || 0
		},
	})

	const {
		data: notifications,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const res = await axios_instance.get("/notifications/all")
			return res.data.data || []
		},
	})

	const markAllasRead = async () => {
		try {
			const { data } = await axios_instance.post("/notifications/read-all")
			if (!data.success)
				toast.error(data.message || "Failed to mark all as read")
			queryclient.refetchQueries({
				queryKey: ["notifications", "unread-count"],
			})
			queryclient.refetchQueries({ queryKey: ["notifications"] })
		} catch (err) {
			console.error("Error marking all as read:", err)
			toast.error("Client error: Failed to mark all as read")
		}
	}

	useEffect(() => {
		if (!socket) return
		socket.on("notification", (_notificationDetails, _isFollowing) => {
			queryclient.refetchQueries({
				queryKey: ["notifications", "unread-count"],
			})
			queryclient.refetchQueries({ queryKey: ["notifications"] })
		})
	})

	// Fetch unread count

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "like":
				return <Heart className="w-5 h-5 text-red-500 fill-current" />
			case "comment":
				return <MessageCircle className="w-5 h-5 text-blue-500" />
			case "follow":
				return <UserCircle2 className="w-5 h-5 text-green-500" />
			default:
				return <UserCircle2 className="w-5 h-5 text-gray-500" />
		}
	}

	if (isLoading) {
		return (
			<div className="flex-1 flex justify-center items-center">
				<Loader className="size-12 animate-spin" />
			</div>
		)
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center py-20 w-full h-full">
				<p className="text-red-500">Failed to load notifications</p>
			</div>
		)
	}

	// Apply filter
	const filteredNotifications =
		filter === "unread"
			? notifications?.filter((notif: any) => !notif.isRead)
			: notifications

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="max-w-lg mx-auto">
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold mb-4">Notifications</h2>

					<div className="flex justify-between">
						<div className="flex gap-4">
							<button
								onClick={() => setFilter("all")}
								className={`text-sm font-medium cursor-pointer ${
									filter === "all"
										? "text-gray-900 border-b-2 border-gray-900"
										: "text-gray-500"
								} pb-2`}
							>
								All
							</button>
							<button
								onClick={() => setFilter("unread")}
								className={`text-sm font-medium cursor-pointer ${
									filter === "unread"
										? "text-gray-900 border-b-2 border-gray-900"
										: "text-gray-500"
								} pb-2`}
							>
								Unread ({unreadCount ?? 0})
							</button>
						</div>
						<button
							className="text-sm font-medium cursor-pointer text-gray-500 pb-2 hover:text-gray-700"
							onClick={markAllasRead}
						>
							Mark all as read
						</button>
					</div>
				</div>

				<div className="divide-y divide-gray-200">
					{filteredNotifications && filteredNotifications.length > 0 ? (
						filteredNotifications.map((notification: any) => (
							<div
								key={notification._id}
								className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
									!notification.isRead ? "bg-blue-50" : ""
								}`}
							>
								{/* User Avatar + Icon */}
								<div className="relative">
									<Image
										src={notification.from.image || "/default-avatar.svg"}
										alt={notification.from.username}
										width={56}
										height={56}
										style={{
											borderRadius: "50%",
											objectFit: "cover",
											aspectRatio: "1 / 1",
										}}
									/>
									<div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
										{getNotificationIcon(notification.type)}
									</div>
								</div>

								{/* Text */}
								<div className="flex-1 min-w-0">
									<p className="text-sm">
										<span
											className="font-semibold"
											onClick={() => {
												window.location.href = `/${notification.from.username}`
											}}
										>
											{notification.from.username}
										</span>{" "}
										{notification.type === "like" && "liked your photo"}
										{notification.type === "comment" &&
											`commented: "${notification.comment ?? ""}"`}
										{notification.type === "follow" && "started following you"}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{new Date(notification.createdAt).toLocaleString()}
									</p>
								</div>

								{/* Post Thumbnail (if applicable) */}
								{notification.post?.image && (
									<div className="flex-shrink-0">
										<Image
											src={notification.post.image}
											alt="Post"
											width={56}
											height={56}
											style={{
												borderRadius: "8px",
												objectFit: "cover",
												aspectRatio: "1 / 1",
											}}
										/>
									</div>
								)}

								{/* Follow button */}
								{notification.type === "follow" && (
									<FollowButton
										username={notification.from.username}
										initialIsFollowing={notification.isFollowing}
									/>
								)}

								{/* Blue dot for unread */}
								{!notification.isRead && (
									<div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
								)}
							</div>
						))
					) : (
						<div className="text-center py-12">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Heart className="w-8 h-8 text-gray-400" />
							</div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								No notifications
							</h3>
							<p className="text-gray-500">
								When people interact with your posts, you'll see them here.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default NotificationsComponent
