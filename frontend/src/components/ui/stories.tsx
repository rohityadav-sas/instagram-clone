"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Image from "next/image"
import { useUserStore } from "@/store/store"
import { useStories } from "@/hooks/useStories"
import CreateStoryDialog from "./create-story-dialog"
import StoryViewer from "./story-viewer"

const Stories = () => {
	const userId = useUserStore((state) => state._id)
	const username = useUserStore((state) => state.username)
	const image = useUserStore((state) => state.image)
	const user = useMemo(
		() => ({
			_id: userId,
			username,
			image: image,
		}),
		[userId, username, image]
	)

	const { groupedStories, isLoading, viewStory } = useStories()
	const [startIndex, setStartIndex] = useState(0)
	const [selectedStory, setSelectedStory] = useState<string | null>(null)
	const visibleCount = 6

	// Convert grouped stories to flat array for easier handling
	const allStories = Object.entries(groupedStories || {})
		.map(([userId, stories]) => {
			if (!Array.isArray(stories) || stories.length === 0) {
				return null
			}

			const firstStory = stories[0]
			if (!firstStory?.author) {
				return null
			}

			return {
				userId,
				user: firstStory.author,
				stories,
				hasViewed: stories.every(
					(story) => story.viewers?.includes(user._id || "") || false
				),
			}
		})
		.filter((story): story is NonNullable<typeof story> => story !== null) // Type-safe filter

	const canScrollLeft = startIndex > 0
	const canScrollRight = startIndex + visibleCount < allStories.length

	const scrollLeft = () => {
		if (canScrollLeft) {
			setStartIndex(startIndex - 1)
		}
	}

	const scrollRight = () => {
		if (canScrollRight) {
			setStartIndex(startIndex + 1)
		}
	}

	const visibleStories = allStories.slice(startIndex, startIndex + visibleCount)

	const handleStoryClick = (userId: string) => {
		setSelectedStory(userId)
	}

	if (isLoading) {
		return (
			<div className="bg-white border rounded-lg p-4 mb-6">
				<div className="flex gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="flex flex-col items-center gap-2 flex-shrink-0"
						>
							<div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
							<div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="bg-white border rounded-lg p-4 mb-6">
				<div className="relative">
					{/* Left scroll button */}
					{canScrollLeft && (
						<button
							onClick={scrollLeft}
							className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
						>
							<ChevronLeft size={20} />
						</button>
					)}

					{/* Right scroll button */}
					{canScrollRight && (
						<button
							onClick={scrollRight}
							className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
						>
							<ChevronRight size={20} />
						</button>
					)}

					<div className="flex gap-4 overflow-hidden">
						{/* Your story */}
						<CreateStoryDialog>
							<div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer">
								<div className="relative">
									<div className="w-16 h-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
										<Image
											src={user.image ? user.image : "/default-avatar.svg"}
											alt={user.username}
											width={56}
											height={56}
											style={{
												objectFit: "cover",
												borderRadius: "50%",
												aspectRatio: "1 / 1",
											}}
										/>
									</div>
									<div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
										<Plus size={12} className="text-white" />
									</div>
								</div>
								<span className="text-xs text-gray-600 font-medium">
									Your story
								</span>
							</div>
						</CreateStoryDialog>

						{/* Other stories */}
						{visibleStories.map((storyGroup) => (
							<div
								key={storyGroup.userId}
								className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
								onClick={() => handleStoryClick(storyGroup.userId)}
							>
								<div
									className={`p-0.5 rounded-full ${
										storyGroup.hasViewed
											? "bg-gray-300"
											: "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
									}`}
								>
									<div className="bg-white p-0.5 rounded-full">
										<Image
											src={storyGroup.user.image || "/default-avatar.svg"}
											alt={storyGroup.user.username}
											width={56}
											height={56}
											style={{
												objectFit: "cover",
												borderRadius: "50%",
												aspectRatio: "1 / 1",
											}}
										/>
									</div>
								</div>
								<span className="text-xs text-gray-600 max-w-[60px] truncate">
									{storyGroup.user.username}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Story Viewer */}
			{selectedStory && (
				<StoryViewer
					stories={groupedStories || {}}
					initialUserId={selectedStory}
					onClose={() => setSelectedStory(null)}
					onStoryView={viewStory}
				/>
			)}
		</>
	)
}

export default Stories
