"use client"
import React from "react"
import { useRouter, usePathname } from "next/navigation"
import toast from "react-hot-toast"
import {
	LogOut,
	Compass,
	Heart,
	Home,
	MessageCircleMore,
	PlusSquare,
	Search,
} from "lucide-react"
import Image from "next/image"
import axios_instance from "@/config/axios"
import { useUserStore } from "@/store/store"
import InstagramLogo from "@/components/ui/instagram-logo"
import SidebarItem from "@/components/ui/sidebar-item"
import CreatePostDialog from "@/components/ui/create-post-dialog"
import { useLoadingStore } from "@/components/ui/loading-bar"

export type SidebarItemType =
	| "Home"
	| "Search"
	| "Explore"
	| "Messages"
	| "Notifications"
	| "Create"
	| "Profile"
	| ""

interface NavigationItem {
	icon: React.ReactNode
	label: string
	onClick?: () => void
}

const createNavigationItems = (
	profilePicture: string | null,
	handleItemChange: (item: SidebarItemType) => void,
	currentUsername: string
): NavigationItem[] => [
	{
		icon: <Home />,
		label: "Home",
		onClick: () => handleItemChange("Home"),
	},
	{
		icon: <Search />,
		label: "Search",
		onClick: () => handleItemChange("Search"),
	},
	{
		icon: <Compass />,
		label: "Explore",
		onClick: () => handleItemChange("Explore"),
	},
	{
		icon: <MessageCircleMore />,
		label: "Messages",
		onClick: () => handleItemChange("Messages"),
	},
	{
		icon: <Heart />,
		label: "Notifications",
		onClick: () => handleItemChange("Notifications"),
	},
	{
		icon: <PlusSquare />,
		label: "Create",
	},
	{
		icon: (
			<Image
				src={profilePicture ? profilePicture : "/default-avatar.svg"}
				alt="Profile"
				height={24}
				width={24}
				style={{
					objectFit: "cover",
					borderRadius: "50%",
					aspectRatio: "1/1",
				}}
			/>
		),
		label: "Profile",
		onClick: () => handleItemChange("Profile"),
	},
]

const Sidebar = () => {
	const router = useRouter()
	const pathname = usePathname()
	const { startLoading, stopLoading } = useLoadingStore()
	const profilePicture = useUserStore((state) => state.profile_picture)
	const currentUsername = useUserStore((state) => state.username)

	const getActiveItem = (): SidebarItemType => {
		if (pathname === "/") return "Home"
		if (pathname === "/search") return "Search"
		if (pathname === "/explore") return "Explore"
		if (pathname === "/messages") return "Messages"
		if (pathname === "/notifications") return "Notifications"
		if (
			pathname.startsWith("/") &&
			pathname !== "/" &&
			!pathname.startsWith("/search") &&
			!pathname.startsWith("/explore") &&
			!pathname.startsWith("/messages") &&
			!pathname.startsWith("/notifications")
		) {
			const name = pathname.slice(1)
			if (name === currentUsername) return "Profile"
			else return ""
		}
		return "Home"
	}

	const currentActiveSidebarItem = getActiveItem()

	const handleLogout = async () => {
		const logOut = async () => {
			try {
				const response = await axios_instance.get("/users/logout")
				const { message, success } = response.data
				if (!success) throw new Error(message)
				return message
			} catch (err) {
				console.error("Logout error:", err)
				throw new Error(err as any)
			}
		}

		toast.promise(
			logOut().then((message) => {
				router.push("/login")
				return message
			}),
			{
				loading: "Logging out...",
				success: (message) => message,
				error: (err) => err.message || "Something went wrong",
			}
		)
	}

	const handleSidebarItemClick = (item: SidebarItemType) => {
		if (item !== "Create") {
			startLoading()

			switch (item) {
				case "Home":
					router.push("/")
					break
				case "Search":
					router.push("/search")
					break
				case "Explore":
					router.push("/explore")
					break
				case "Messages":
					router.push("/messages")
					break
				case "Notifications":
					router.push("/notifications")
					break
				case "Profile":
					router.push(`/${currentUsername}`)
					break
				default:
					router.push("/")
			}

			setTimeout(() => stopLoading(), 500)
		}
	}

	const navigationItems = createNavigationItems(
		profilePicture,
		handleSidebarItemClick,
		currentUsername
	)

	return (
		<aside className="border-r border-gray-200 h-screen w-64 p-4 py-8 pb-6 flex flex-col bg-gray-50">
			<InstagramLogo />

			<nav className="flex flex-col gap-1 flex-1">
				{navigationItems.map((item) => (
					<div key={item.label}>
						{item.label === "Create" ? (
							<CreatePostDialog />
						) : (
							<SidebarItem
								icon={item.icon}
								label={item.label}
								onClick={item.onClick}
								isActive={currentActiveSidebarItem === item.label}
							/>
						)}
					</div>
				))}

				<div className="mt-auto pt-4">
					<SidebarItem
						icon={<LogOut />}
						label="Logout"
						onClick={handleLogout}
						isActive={false}
					/>
				</div>
			</nav>
		</aside>
	)
}

export default Sidebar
