"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { X, Pause, Play, MoreHorizontal, Heart, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { type Story } from "@/types/story"
import { useUserStore } from "@/store/store"

interface StoryViewerProps {
	stories: { [userId: string]: Story[] }
	initialUserId: string
	onClose: () => void
	onStoryView?: (storyId: string) => void
}

const StoryViewer = ({
	stories,
	initialUserId,
	onClose,
	onStoryView,
}: StoryViewerProps) => {
	// Get user IDs in order and find initial user
	const userIds = Object.keys(stories)
	const initialUserIndex = userIds.indexOf(initialUserId)
	const [currentUserIndex, setCurrentUserIndex] = useState(
		initialUserIndex >= 0 ? initialUserIndex : 0
	)
	const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
	const [isPaused, setIsPaused] = useState(false)
	const [progress, setProgress] = useState(0)
	const [showControls, setShowControls] = useState(true)
	const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const viewedStoriesRef = useRef<Set<string>>(new Set())
	const currentUsername = useUserStore((state) => state.username)

	const STORY_DURATION = 5000 // 5 seconds per story

	// Get current user's stories
	const currentUserId = userIds[currentUserIndex]
	const currentUserStories = stories[currentUserId] || []
	const currentStory = currentUserStories[currentStoryIndex]

	const nextStory = useCallback(() => {
		if (currentStoryIndex < currentUserStories.length - 1) {
			setCurrentStoryIndex((prev) => prev + 1)
		} else if (currentUserIndex < userIds.length - 1) {
			// Move to next user's stories
			setCurrentUserIndex((prev) => prev + 1)
			setCurrentStoryIndex(0)
		} else {
			// End of all stories
			onClose()
		}
		setProgress(0)
	}, [
		currentStoryIndex,
		currentUserStories.length,
		currentUserIndex,
		userIds.length,
		onClose,
	])

	const previousStory = useCallback(() => {
		if (currentStoryIndex > 0) {
			setCurrentStoryIndex((prev) => prev - 1)
		} else if (currentUserIndex > 0) {
			// Move to previous user's last story
			const prevUserStories = stories[userIds[currentUserIndex - 1]]
			setCurrentUserIndex((prev) => prev - 1)
			setCurrentStoryIndex(prevUserStories.length - 1)
		}
		setProgress(0)
	}, [currentStoryIndex, currentUserIndex, stories, userIds])

	const startProgress = useCallback(() => {
		if (isPaused) return

		progressIntervalRef.current = setInterval(() => {
			setProgress((prev) => {
				const newProgress = prev + 100 / (STORY_DURATION / 50)
				if (newProgress >= 100) {
					nextStory()
					return 0
				}
				return newProgress
			})
		}, 50)
	}, [isPaused, nextStory])

	const stopProgress = useCallback(() => {
		if (progressIntervalRef.current) {
			clearInterval(progressIntervalRef.current)
			progressIntervalRef.current = null
		}
	}, [])

	useEffect(() => {
		if (!isPaused) {
			startProgress()
		} else {
			stopProgress()
		}

		return () => stopProgress()
	}, [isPaused, currentStory, startProgress, stopProgress])

	useEffect(() => {
		// Mark story as viewed (only once per story)
		if (
			currentStory &&
			onStoryView &&
			!viewedStoriesRef.current.has(currentStory._id)
		) {
			viewedStoriesRef.current.add(currentStory._id)
			onStoryView(currentStory._id)
		}
	}, [currentStory, onStoryView])

	const handlePauseToggle = () => {
		setIsPaused(!isPaused)
	}

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				previousStory()
			} else if (e.key === "ArrowRight") {
				nextStory()
			} else if (e.key === "Escape") {
				onClose()
			} else if (e.key === " ") {
				e.preventDefault()
				handlePauseToggle()
			}
		},
		[previousStory, nextStory, onClose]
	)

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [handleKeyDown])

	const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null)

	const showControlsTemporarily = () => {
		setShowControls(true)
		if (hideControlsTimeout.current) {
			clearTimeout(hideControlsTimeout.current)
		}
		hideControlsTimeout.current = setTimeout(() => {
			setShowControls(false)
		}, 3000)
	}

	useEffect(() => {
		showControlsTemporarily()
		return () => {
			if (hideControlsTimeout.current) {
				clearTimeout(hideControlsTimeout.current)
			}
		}
	}, [currentStory])

	if (!currentStory) {
		return null
	}

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black z-50 flex items-center justify-center"
				onMouseMove={showControlsTemporarily}
				onClick={showControlsTemporarily}
			>
				{/* Background overlay */}
				<div className="absolute inset-0 bg-black" />

				{/* Main story container */}
				<div className="relative w-full max-w-sm h-full bg-black flex flex-col">
					{/* Header */}
					<AnimatePresence>
						{showControls && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="absolute top-0 left-0 right-0 z-20 p-4"
							>
								{/* Progress bars */}
								<div className="flex gap-1 mb-3">
									{currentUserStories.map((_, index) => (
										<div
											key={index}
											className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
										>
											<div
												className="h-full bg-white transition-all duration-100"
												style={{
													width:
														index < currentStoryIndex
															? "100%"
															: index === currentStoryIndex
															? `${progress}%`
															: "0%",
												}}
											/>
										</div>
									))}
								</div>

								{/* User info and controls */}
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Image
											src={currentStory.author.image || "/default-avatar.svg"}
											alt={currentStory.author.username}
											width={32}
											height={32}
											className="rounded-full object-cover"
										/>
										<div>
											<p className="text-white font-medium text-sm">
												{currentStory.author.username}
											</p>
											<p className="text-white/70 text-xs">
												{new Date(currentStory.createdAt).toLocaleTimeString(
													[],
													{
														hour: "2-digit",
														minute: "2-digit",
													}
												)}
											</p>
										</div>
									</div>

									<div className="flex items-center gap-3">
										<button
											onClick={handlePauseToggle}
											className="text-white p-1 hover:bg-white/20 rounded-full transition-colors"
										>
											{isPaused ? <Play size={20} /> : <Pause size={20} />}
										</button>

										{currentStory.author.username === currentUsername && (
											<button className="text-white p-1 hover:bg-white/20 rounded-full transition-colors">
												<MoreHorizontal size={20} />
											</button>
										)}

										<button
											onClick={onClose}
											className="text-white p-1 hover:bg-white/20 rounded-full transition-colors"
										>
											<X size={20} />
										</button>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Story content */}
					<div
						className="flex-1 relative overflow-hidden bg-gray-900"
						onClick={(e) => {
							const rect = e.currentTarget.getBoundingClientRect()
							const x = e.clientX - rect.left
							const centerX = rect.width / 2

							if (x < centerX) {
								previousStory()
							} else {
								nextStory()
							}
						}}
					>
						{currentStory.image && (
							<Image
								src={currentStory.image}
								alt="Story"
								fill
								className="object-contain"
								priority
							/>
						)}

						{/* Navigation areas */}
						<div className="absolute inset-0 flex">
							<div className="flex-1" />
							<div className="flex-1" />
						</div>
					</div>

					{/* Bottom actions */}
					<AnimatePresence>
						{showControls && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 20 }}
								className="absolute bottom-0 left-0 right-0 p-4"
							>
								<div className="flex items-center gap-3">
									<input
										type="text"
										placeholder="Send message"
										className="flex-1 bg-transparent border border-white/30 rounded-full px-4 py-2 text-white placeholder-white/70 text-sm focus:outline-none focus:border-white/50"
									/>
									<button className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
										<Heart size={20} />
									</button>
									<button className="text-white p-2 hover:bg-white/20 rounded-full transition-colors">
										<Send size={20} />
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Left/Right navigation hints */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xs">
						← Previous
					</div>
					<div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-xs">
						Next →
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	)
}

export default StoryViewer
