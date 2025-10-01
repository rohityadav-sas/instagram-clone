import { CheckCircle } from "lucide-react"
import Image from "next/image"

interface UserProfileProps {
	username: string
	image?: string
	emailVerified?: boolean
	avatarSize?: number
	showVerified?: boolean
	className?: string
	text?: string
	usernameClassName?: string
	textCreatedAt?: string
}

const UserProfile = ({
	username,
	image,
	emailVerified = false,
	avatarSize = 25,
	showVerified = true,
	text = "",
	textCreatedAt,
}: UserProfileProps) => {
	const calculateTimeAgo = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)
		if (secondsAgo < 60) return `${secondsAgo}s`
		const minutesAgo = Math.floor(secondsAgo / 60)
		if (minutesAgo < 60) return `${minutesAgo}m`
		const hoursAgo = Math.floor(minutesAgo / 60)
		if (hoursAgo < 24) return `${hoursAgo}h`
		const daysAgo = Math.floor(hoursAgo / 24)
		return `${daysAgo}d`
	}

	return (
		<div className={`flex gap-2 items-start`}>
			<Image
				src={image || "/default-avatar.svg"}
				alt={username || "User Avatar"}
				width={avatarSize}
				height={avatarSize}
				style={{
					objectFit: "cover",
					borderRadius: "50%",
					aspectRatio: "1 / 1",
				}}
			/>
			<div className="flex flex-col">
				<div className="flex gap-1 items-center">
					<span
						className={`font-bold cursor-pointer`}
						onClick={() => {
							window.location.href = `/${username}`
						}}
					>
						{username}
					</span>
					{showVerified && emailVerified && (
						<CheckCircle className="size-3 text-blue-500" />
					)}
				</div>
				<div className="flex flex-col gap-1">
					{text && <p className="text-sm">{text}</p>}
					{textCreatedAt && (
						<p className="text-xs text-gray-500">
							{calculateTimeAgo(textCreatedAt)}
						</p>
					)}
				</div>
			</div>
		</div>
	)
}

export default UserProfile
