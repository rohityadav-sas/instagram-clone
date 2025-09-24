import { useState } from "react"
import { Heart, MessageCircle, UserCircle2 } from "lucide-react"
import Image from "next/image"

// Temporary mock data until real API integration
const mockNotifications = [
	{
		id: "notif-1",
		type: "like",
		user: {
			username: "john_doe",
			profile_picture: "/default-avatar.svg",
		},
		message: "liked your photo",
		timestamp: "2m",
		isRead: false,
		post: {
			image: "/login_banner.png",
		},
	},
	{
		id: "notif-2",
		type: "follow",
		user: {
			username: "emma_wilson",
			profile_picture: "/default-avatar.svg",
		},
		message: "started following you",
		timestamp: "1h",
		isRead: false,
	},
	{
		id: "notif-3",
		type: "comment",
		user: {
			username: "mike_chen",
			profile_picture: "/default-avatar.svg",
		},
		message: 'commented on your photo: "Amazing shot! 📸"',
		timestamp: "3h",
		isRead: true,
		post: {
			image: "/login_banner.png",
		},
	},
]

const NotificationsComponent = () => {
	const [filter, setFilter] = useState<"all" | "unread">("all")

	const filteredNotifications =
		filter === "unread"
			? mockNotifications.filter((notif) => !notif.isRead)
			: mockNotifications

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

	return (
		<div className="flex-1 overflow-y-auto">
			<div className="max-w-lg mx-auto">
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold mb-4">Notifications</h2>

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
							Unread ({mockNotifications.filter((n) => !n.isRead).length})
						</button>
					</div>
				</div>

				<div className="divide-y divide-gray-200">
					{filteredNotifications.length > 0 ? (
						filteredNotifications.map((notification) => (
							<div
								key={notification.id}
								className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 ${
									!notification.isRead ? "bg-blue-50" : ""
								}`}
							>
								<div className="relative">
									<Image
										src={
											notification.user.profile_picture ?? "/default-avatar.svg"
										}
										alt={notification.user.username}
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

								<div className="flex-1 min-w-0">
									<p className="text-sm">
										<span className="font-semibold">
											{notification.user.username}
										</span>{" "}
										{notification.message}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{notification.timestamp}
									</p>
								</div>

								{notification.post && (
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

								{notification.type === "follow" && (
									<button className="px-4 py-1 text-xs font-semibold text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition-colors">
										Follow
									</button>
								)}

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
