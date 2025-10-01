import { useMemo, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"
import { type Story } from "@/types/story"
import { useUserStore } from "@/store/store"

interface GroupedStories {
	[userId: string]: Story[]
}

export const useStories = () => {
	const queryClient = useQueryClient()
	const userId = useUserStore((state) => state._id)

	const {
		data: stories = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["stories"],
		queryFn: async () => {
			const response = await axios_instance.get("/stories")
			if (!response.data.success) {
				throw new Error(response.data.message || "Failed to fetch stories")
			}
			return response.data.stories
		},
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	})

	// The backend returns grouped stories, so we use them directly
	const groupedStories: GroupedStories = useMemo(() => {
		const grouped: GroupedStories = {}

		if (!stories || !Array.isArray(stories)) {
			return grouped
		}

		// If backend returns grouped format, extract individual stories
		if (stories.length > 0 && stories[0]?.stories) {
			// Backend returns grouped format
			stories.forEach((group: any) => {
				if (group?.author?._id && Array.isArray(group.stories)) {
					const authorId = group.author._id
					grouped[authorId] = group.stories
				}
			})
		} else {
			// Backend returns flat format (fallback)
			stories.forEach((story: Story) => {
				if (story?.author?._id) {
					const authorId = story.author._id
					if (!grouped[authorId]) {
						grouped[authorId] = []
					}
					grouped[authorId].push(story)
				}
			})
		}
		return grouped
	}, [stories])

	const createStoryMutation = useMutation({
		mutationFn: async (imageFile: File) => {
			const formData = new FormData()
			formData.append("image", imageFile)

			const response = await axios_instance.post("/stories", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})

			if (!response.data.success) {
				throw new Error(response.data.message || "Failed to create story")
			}

			return response.data.story
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stories"] })
			toast.success("Story created successfully!")
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to create story")
		},
	})

	const deleteStoryMutation = useMutation({
		mutationFn: async (storyId: string) => {
			const response = await axios_instance.delete(`/stories/${storyId}`)
			if (!response.data.success) {
				throw new Error(response.data.message || "Failed to delete story")
			}
			return response.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["stories"] })
			toast.success("Story deleted successfully!")
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to delete story")
		},
	})

	const viewStoryMutation = useMutation({
		mutationFn: async (storyId: string) => {
			const response = await axios_instance.post(`/stories/${storyId}/view`)
			if (!response.data.success) {
				throw new Error(response.data.message || "Failed to view story")
			}
			return response.data
		},
		onMutate: async (storyId: string) => {
			// Cancel any outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({ queryKey: ["stories"] })

			// Snapshot the previous value
			const previousStories = queryClient.getQueryData(["stories"])

			// Optimistically update the cache
			queryClient.setQueryData(["stories"], (oldData: any) => {
				if (!oldData || !Array.isArray(oldData)) return oldData

				return oldData.map((group: any) => {
					if (group?.stories && Array.isArray(group.stories)) {
						return {
							...group,
							stories: group.stories.map((story: any) => {
								if (story._id === storyId) {
									// Add current user to viewers if not already there
									const currentViewers = story.viewers || []
									if (!currentViewers.includes(userId)) {
										return {
											...story,
											viewers: [...currentViewers, userId],
										}
									}
								}
								return story
							}),
						}
					}
					return group
				})
			})

			// Return a context object with the snapshotted value
			return { previousStories }
		},
		onError: (err, _storyId, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousStories) {
				queryClient.setQueryData(["stories"], context.previousStories)
			}
			console.error("Failed to mark story as viewed:", err)
			// Optionally show a toast for network errors
			toast.error("Failed to mark story as viewed")
		},
		onSettled: () => {
			// Only invalidate on error, success should keep optimistic update
			// This ensures we get fresh data but don't unnecessarily refetch on success
		},
	})

	const createStory = useCallback((imageFile: File) => {
		createStoryMutation.mutate(imageFile)
	}, [])

	const deleteStory = useCallback((storyId: string) => {
		deleteStoryMutation.mutate(storyId)
	}, [])

	const viewStory = useCallback((storyId: string) => {
		viewStoryMutation.mutate(storyId)
	}, [])

	// Extract individual stories for compatibility
	const allStories = useMemo(() => {
		return Object.values(groupedStories).flat()
	}, [groupedStories])

	return {
		stories: allStories,
		groupedStories,
		isLoading,
		error,
		createStory,
		deleteStory,
		viewStory,
		isCreating: createStoryMutation.isPending,
		isDeleting: deleteStoryMutation.isPending,
	}
}

export const useUserStories = (userId: string) => {
	const {
		data: stories = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["userStories", userId],
		queryFn: async () => {
			const response = await axios_instance.get(`/stories/user/${userId}`)
			if (!response.data.success) {
				throw new Error(response.data.message || "Failed to fetch user stories")
			}
			return response.data.stories
		},
		enabled: !!userId,
	})

	return {
		stories,
		isLoading,
		error,
	}
}
