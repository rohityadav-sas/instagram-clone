"use client"
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import { useFollowUser } from "@/hooks/useFollowUser"
import { type SearchUser } from "@/hooks/useSearch"
import { useRouter } from "next/navigation"

interface SearchUserItemProps {
	user: SearchUser
}

const SearchUserItem = ({ user }: SearchUserItemProps) => {
	const { isFollowing, isLoading, toggleFollow } = useFollowUser(
		user.username,
		user.isFollowing,
		user.followersCount
	)
	const router = useRouter()

	return (
		<div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
			<Image
				src={user.image || "/default-avatar.svg"}
				alt={user.username}
				width={44}
				height={44}
				style={{
					aspectRatio: "1 / 1",
					borderRadius: "50%",
					objectFit: "cover",
				}}
			/>
			<div className="flex-1 min-w-0 cursor-pointer">
				<div className="flex items-center gap-1">
					<p
						className="font-semibold text-sm truncate"
						onClick={() => {
							router.push(`/${user.username}`)
						}}
					>
						{user.username}
					</p>
					{user.emailVerified && (
						<CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
					)}
				</div>
				<p className="text-xs text-gray-500 truncate">
					{user.bio || `${user.followersCount} followers`}
				</p>
			</div>
			<button
				onClick={(e) => {
					e.stopPropagation()
					toggleFollow()
				}}
				disabled={isLoading}
				className={`px-3 cursor-pointer py-1 text-xs font-semibold rounded transition-colors ${
					isLoading
						? "opacity-50 cursor-wait"
						: isFollowing
						? "text-gray-700 border border-gray-300 hover:bg-gray-50"
						: "text-blue-500 border border-blue-500 hover:bg-blue-50"
				}`}
			>
				{isLoading ? "..." : isFollowing ? "Following" : "Follow"}
			</button>
		</div>
	)
}

export default SearchUserItem
