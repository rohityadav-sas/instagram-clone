"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"

export const usePostComments = (postId: string) => {
	const queryClient = useQueryClient()

	// Fetch comments from API
	const {
		data: comments = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["comments", postId],
		queryFn: async () => {
			const response = await axios_instance.get(`/comments/get/${postId}`)
			if (!response.data.success) {
				throw new Error(response.data.message || "Failed to fetch comments")
			}
			return response.data.data
		},
	})

	const addCommentMutation = useMutation({
		mutationFn: async (commentText: string) => {
			const response = await axios_instance.post(`/comments/create/${postId}`, {
				text: commentText,
			})
			if (!response.data.success) {
				throw new Error(response.data.message || "Failed to add comment")
			}
			return response.data.data
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["comments", postId] })
		},
	})

	const addComment = (commentText: string) => {
		toast.promise(
			async () => {
				await addCommentMutation.mutateAsync(commentText)
			},
			{
				loading: "Adding comment...",
				success: "Comment added!",
				error: "Failed to add comment",
			}
		)
	}

	return {
		comments,
		isLoading,
		error,
		addComment,
		isAddingComment: addCommentMutation.isPending,
	}
}
