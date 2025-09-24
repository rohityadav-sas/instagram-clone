import axios_instance from "@/config/axios"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { useQuery } from "@tanstack/react-query"
import { Ellipsis } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import toast from "react-hot-toast"

interface PostHeaderProps {
	username: string
	userAvatar?: string
}

const PostHeader = ({ username, userAvatar }: PostHeaderProps) => {
	const [moreOpen, setMoreOpen] = useState(false)
	const [isFollowing, setIsFollowing] = useState(true)

	useQuery({
		queryKey: ["dialog-data"],
		queryFn: async () => {
			const { data } = await axios_instance.get(
				"/users/is-following/" + username
			)
			setIsFollowing(data.data)
			return data.data
		},
	})

	const unfollowPostAuthor = () => {
		const unfollow = async () => {
			const { data } = await axios_instance.post(
				"/users/toggle-follow/" + username
			)

			if (!data.success)
				throw new Error(data.message || "Failed to toggle follow")

			setMoreOpen(false)
			setIsFollowing((x) => !x)
		}

		toast.promise(unfollow(), {
			loading: isFollowing ? "Unfollowing..." : "Following...",
			success: () => {
				return isFollowing ? "Unfollowed successfully" : "Followed successfully"
			},
			error: (err) => err.message || "Failed to toggle follow",
		})
	}
	return (
		<div className="flex items-center justify-between w-full">
			<div className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity">
				<div className="relative w-8 h-8">
					<Image
						src={userAvatar || "/default-avatar.svg"}
						alt={`${username}'s avatar`}
						fill
						className="rounded-full object-cover"
					/>
				</div>
				<div className="flex flex-col">
					<span
						className="text-sm font-semibold text-gray-900"
						onClick={() => {
							window.location.href = `/${username}`
						}}
					>
						{username}
					</span>
				</div>
			</div>
			<Dialog open={moreOpen} onOpenChange={setMoreOpen}>
				<DialogTrigger asChild>
					<Ellipsis className="w-5 h-5 text-gray-600 cursor-pointer" />
				</DialogTrigger>
				<DialogContent className="rounded-lg shadow-lg p-0 overflow-hidden bg-white [&>button]:hidden">
					<DialogTitle className="sr-only">More Options</DialogTitle>
					<div className="flex flex-col divide-y divide-gray-200">
						<p
							className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors text-center"
							onClick={unfollowPostAuthor}
						>
							{isFollowing ? "Unfollow" : "Follow"}
						</p>
						<DialogClose>
							<p className="px-4 py-3 text-red-500 hover:bg-red-50 cursor-pointer transition-colors font-semibold">
								Cancel
							</p>
						</DialogClose>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default PostHeader
