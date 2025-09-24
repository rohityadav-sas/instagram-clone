"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Camera, X } from "lucide-react"
import Image from "next/image"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEditProfile } from "@/hooks/useEditProfile"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useUserStore } from "@/store/store"
import axios_instance from "@/config/axios"

interface EditProfileDialogProps {
	children: React.ReactNode
	currentProfile: {
		username: string
		bio: string
		gender: string
		profile_picture: string
	}
}

interface FormData {
	username: string
	bio: string
	gender: string
	password: string
}

const EditProfileDialog = ({
	children,
	currentProfile,
}: EditProfileDialogProps) => {
	const [open, setOpen] = useState(false)
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const { username, setUserAsync } = useUserStore()
	const router = useRouter()
	const queryClient = useQueryClient()

	const { editProfile, isLoading } = useEditProfile()

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			username: "",
			bio: "",
			gender: "male",
			password: "",
		},
	})

	// Reset form when dialog opens
	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (newOpen) {
			// Reset form with current profile data when opening
			reset({
				username: currentProfile.username || "",
				bio: currentProfile.bio || "",
				gender: currentProfile.gender || "male",
				password: "",
			})
			setPreviewImage(null)
			setSelectedFile(null)
		}
	}

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setSelectedFile(file)
			setPreviewImage(URL.createObjectURL(file))
		}
	}

	const removeImage = () => {
		setSelectedFile(null)
		setPreviewImage(null)
	}

	const onSubmit = (data: FormData) => {
		const submitData: any = {}

		// Only include changed fields
		if (data.username.trim() && data.username !== currentProfile.username) {
			submitData.username = data.username.trim()
		}
		if (data.bio.trim() !== currentProfile.bio) {
			submitData.bio = data.bio.trim()
		}
		if (data.gender !== currentProfile.gender) {
			submitData.gender = data.gender
		}
		if (data.password.trim()) {
			submitData.password = data.password.trim()
		}
		if (selectedFile) {
			submitData.profile_picture = selectedFile
		}

		// Only submit if there are changes
		if (Object.keys(submitData).length === 0) {
			setOpen(false)
			return
		}

		toast.promise(
			editProfile(submitData).then(async () => {
				setOpen(false)
				reset()
				setPreviewImage(null)
				setSelectedFile(null)
				const { data } = await axios_instance.get("/users/me")
				await setUserAsync(data.data)
				window.location.href = `/${data.data.username}`
			}),
			{
				loading: "Updating profile...",
				success: "Profile updated successfully!",
				error: (err) => err?.message || "Failed to update profile",
			}
		)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{/* Profile Picture Section */}
					<div className="flex flex-col items-center space-y-4">
						<div className="relative">
							<div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
								<Image
									src={
										previewImage ||
										currentProfile.profile_picture ||
										"/default-avatar.svg"
									}
									alt="Profile"
									width={128}
									height={128}
									className="w-full h-full object-cover"
								/>
							</div>

							{previewImage && (
								<button
									type="button"
									onClick={removeImage}
									className="absolute -top-2 cursor-pointer -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
								>
									<X className="w-4 h-4" />
								</button>
							)}
						</div>

						<div>
							<input
								type="file"
								id="profile-picture"
								accept="image/*"
								onChange={handleImageChange}
								className="hidden"
							/>
							<label
								htmlFor="profile-picture"
								className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
							>
								<Camera className="w-4 h-4" />
								Change Photo
							</label>
						</div>
					</div>

					{/* Form Fields */}
					<div className="space-y-4">
						<div>
							<Label htmlFor="username">Username</Label>
							<Input
								id="username"
								{...register("username", {
									required: "Username is required",
									minLength: {
										value: 3,
										message: "Username must be at least 3 characters",
									},
									maxLength: {
										value: 20,
										message: "Username must be less than 20 characters",
									},
									pattern: {
										value: /^[a-zA-Z0-9_]+$/,
										message:
											"Username can only contain letters, numbers, and underscores",
									},
								})}
								placeholder={currentProfile.username}
								className="mt-1"
							/>
							{errors.username && (
								<p className="text-sm text-red-500 mt-1">
									{errors.username.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="bio">Bio</Label>
							<textarea
								id="bio"
								{...register("bio", {
									maxLength: {
										value: 150,
										message: "Bio must be less than 150 characters",
									},
								})}
								placeholder={currentProfile.bio || "Tell us about yourself..."}
								className="mt-1 resize-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								rows={3}
							/>
							{errors.bio && (
								<p className="text-sm text-red-500 mt-1">
									{errors.bio.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="gender">Gender</Label>
							<select
								id="gender"
								{...register("gender", {
									required: "Gender is required",
								})}
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
							</select>
							{errors.gender && (
								<p className="text-sm text-red-500 mt-1">
									{errors.gender.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="password">New Password (optional)</Label>
							<Input
								id="password"
								type="password"
								{...register("password", {
									minLength: {
										value: 6,
										message: "Password must be at least 6 characters",
									},
								})}
								placeholder="Enter new password"
								className="mt-1"
							/>
							{errors.password && (
								<p className="text-sm text-red-500 mt-1">
									{errors.password.message}
								</p>
							)}
							<p className="text-sm text-gray-500 mt-1">
								Leave blank to keep current password
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="flex-1 cursor-pointer"
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="flex-1 cursor-pointer"
							disabled={isLoading}
						>
							{isLoading ? "Updating..." : "Save Changes"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default EditProfileDialog
