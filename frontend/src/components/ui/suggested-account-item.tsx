"use client"
import { CheckCircle } from "lucide-react"
import Image from "next/image"
import { useFollowUser } from "@/hooks/useFollowUser"
import { type SuggestedUser } from "@/hooks/useSuggestedUsers"

interface SuggestedAccountItemProps {
	account: SuggestedUser
}

const SuggestedAccountItem = ({ account }: SuggestedAccountItemProps) => {
	const { isFollowing, isLoading, toggleFollow } = useFollowUser(
		account.username,
		account.isFollowing || false
	)
	console.log(account.followedBy)

	return (
		<div className="flex items-center gap-3 py-2">
			{/* Avatar */}
			<button className="relative flex-shrink-0 cursor-pointer">
				<Image
					src={account.image || "/default-avatar.svg"}
					alt={`${account.username}'s avatar`}
					width={50}
					height={50}
					style={{
						aspectRatio: "1 / 1",
						borderRadius: "50%",
						objectFit: "cover",
					}}
				/>
			</button>

			{/* User Info */}
			<div className="flex-1 min-w-0">
				<button className="block text-left w-full">
					<div className="flex items-center gap-1">
						<span
							className="text-sm font-semibold text-gray-900 truncate cursor-pointer"
							onClick={() => {
								window.location.href = `/${account.username}`
							}}
						>
							{account.username}
						</span>
						{account.emailVerified && (
							<CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
						)}
					</div>
					{account.bio && (
						<div className="text-xs text-gray-500 truncate">{account.bio}</div>
					)}
					{account.followedBy && account.followedBy.length > 0 && (
						<div className="text-xs text-gray-400 w-fit whitespace-nowrap">
							Followed by {account.followedBy[0]}
							{account.followedBy.length > 1 &&
								` + ${account.followedBy.length - 1} more`}
						</div>
					)}
				</button>
			</div>

			{/* Follow Button */}
			<button
				disabled={isLoading}
				onClick={toggleFollow}
				className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
					isFollowing
						? "text-gray-700 hover:text-gray-900"
						: "text-blue-500 hover:text-blue-700"
				} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
			>
				{isLoading ? "..." : isFollowing ? "Following" : "Follow"}
			</button>
		</div>
	)
}

export default SuggestedAccountItem
