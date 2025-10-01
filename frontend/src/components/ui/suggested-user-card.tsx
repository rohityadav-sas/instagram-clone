import Image from "next/image"
import { useFollowUser } from "@/hooks/useFollowUser"

interface SuggestedUserCardProps {
	username: string
	image?: string
	bio?: string
}

const SuggestedUserCard = ({
	username,
	image,
	bio,
}: SuggestedUserCardProps) => {
	const { isFollowing, isLoading, toggleFollow } = useFollowUser(
		username,
		false
	)

	return (
		<div className="text-center p-4 border border-gray-200 rounded-lg flex flex-col items-center">
			<Image
				src={image ? image : "/default-avatar.svg"}
				alt={username}
				width={80}
				height={80}
				style={{
					borderRadius: "50%",
					objectFit: "cover",
					aspectRatio: "1 / 1",
				}}
			/>
			<p className="font-semibold text-sm mb-1">{username}</p>
			<p
				className="text-xs text-gray-500 mb-3 h-8 overflow-hidden text-ellipsis"
				style={{
					display: "-webkit-box",
					WebkitLineClamp: 2,
					WebkitBoxOrient: "vertical",
				}}
			>
				{bio}
			</p>
			<button
				onClick={toggleFollow}
				disabled={isLoading}
				className={`cursor-pointer px-4 py-1 text-xs font-semibold border rounded transition-colors ${
					isLoading
						? "opacity-50 cursor-wait"
						: isFollowing
						? "text-gray-700 border-gray-300 hover:bg-gray-50"
						: "text-blue-500 border-blue-500 hover:bg-blue-50"
				}`}
			>
				{isLoading ? "..." : isFollowing ? "Following" : "Follow"}
			</button>
		</div>
	)
}

export default SuggestedUserCard
