"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"
import { useUserStore } from "@/store/store"

interface EditProfileData {
	username?: string
	bio?: string
	gender?: string
	password?: string
	profile_picture?: File
}

export const useEditProfile = () => {
	const editProfileMutation = useMutation({
		mutationFn: async (data: EditProfileData) => {
			const formData = new FormData()

			// Add text fields only if they have values
			if (data.username?.trim())
				formData.append("username", data.username.trim())
			if (data.bio?.trim()) formData.append("bio", data.bio.trim())
			if (data.gender) formData.append("gender", data.gender)
			if (data.password?.trim())
				formData.append("password", data.password.trim())

			// Add image file if provided
			if (data.profile_picture) {
				formData.append("profile_picture", data.profile_picture)
			}

			const response = await axios_instance.post(
				"/users/profile/edit",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			)

			if (!response.data.success) {
				throw new Error(response.data.message || "Failed to update profile")
			}

			return response.data
		},

		onError: (error: any) => {
			console.error("Error updating profile:", error)
		},
	})

	return {
		editProfile: editProfileMutation.mutateAsync,
		isLoading: editProfileMutation.isPending,
		error: editProfileMutation.error,
	}
}
