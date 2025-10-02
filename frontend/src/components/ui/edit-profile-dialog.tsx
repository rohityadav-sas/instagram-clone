"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { useUserStore } from "@/store/store"
import axios_instance from "@/config/axios"
import { authClient } from "@/auth/auth-client"

interface EditProfileDialogProps {
	children: React.ReactNode
	currentProfile: {
		name: string
		username: string
		bio: string
		gender: string
		image: string
	}
}

interface FormData {
	name: string
	username: string
	bio: string
	gender: string
	currentPassword?: string
	newPassword?: string
	revokeSessions?: boolean
}

const EditProfileDialog = ({
	children,
	currentProfile,
}: EditProfileDialogProps) => {
	const [open, setOpen] = useState(false)
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const { setUserAsync } = useUserStore()
	const [isLoading, setIsLoading] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors: _ },
	} = useForm<FormData>({
		defaultValues: {
			bio: "",
			gender: "male",
			revokeSessions: false,
		},
	})

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen)
		if (newOpen) {
			reset({
				bio: currentProfile.bio || "",
				gender: currentProfile.gender || "male",
				revokeSessions: false,
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
		setIsLoading(true)
		const submitData: any = {}

		if (data.name?.trim() && data.name.trim() !== currentProfile.name) {
			submitData.name = data.name.trim()
		}
		if (
			data.username?.trim() &&
			data.username.trim() !== currentProfile.username
		) {
			submitData.username = data.username.trim()
		}
		if (data.bio?.trim() && data.bio.trim() !== currentProfile.bio) {
			submitData.bio = data.bio.trim()
		}
		if (data.gender && data.gender !== currentProfile.gender) {
			submitData.gender = data.gender
		}
		if (selectedFile) {
			submitData.image = selectedFile
		}

		if (data.currentPassword && data.newPassword) {
			submitData.currentPassword = data.currentPassword
			submitData.newPassword = data.newPassword
		}
		if (data.revokeSessions && data.revokeSessions) {
			authClient.revokeOtherSessions()
		}

		if (Object.keys(submitData).length === 0) {
			setOpen(false)
			setIsLoading(false)
			return
		}

		const editProfile = async () => {
			try {
				const { data: updateData } = await axios_instance.post(
					"/users/profile/edit",
					submitData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				)
				if (!updateData.success) throw new Error(updateData.message)
				setOpen(false)
				reset()
				setPreviewImage(null)
				setSelectedFile(null)
				const { data } = await axios_instance.get("/users/me")
				await setUserAsync(data.data)
				window.location.href = `/${data.data.username}`
			} catch (err) {
				throw err
			}
		}

		toast
			.promise(editProfile(), {
				loading: "Updating profile...",
				success: "Profile updated successfully!",
				error: (err) => err?.message || "Failed to update profile",
			})
			.finally(() => {
				setIsLoading(false)
			})
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
										currentProfile.image ||
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

					{/* Profile Info Fields */}
					<div className="space-y-4">
						<div className="flex flex-col gap-1">
							<Label htmlFor="name">Name</Label>
							<input
								id="name"
								{...register("name")}
								placeholder={currentProfile.name || "Enter your name..."}
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor="username">Username</Label>
							<input
								id="username"
								{...register("username")}
								placeholder={
									currentProfile.username || "Enter your username..."
								}
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor="bio">Bio</Label>
							<textarea
								id="bio"
								{...register("bio")}
								placeholder={currentProfile.bio || "Tell us about yourself..."}
								className="mt-1 resize-none w-full px-3 py-2 border border-gray-300 rounded-md"
								rows={3}
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor="gender">Gender</Label>
							<select
								id="gender"
								{...register("gender")}
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
							>
								<option value="male">Male</option>
								<option value="female">Female</option>
								<option value="other">Other</option>
							</select>
						</div>
					</div>

					{/* ✅ Change Password Section */}
					<div className="space-y-4 border-t pt-4">
						<h3 className="text-md font-semibold">Change Password</h3>
						<div className="flex flex-col gap-1">
							<Label htmlFor="currentPassword">Current Password</Label>
							<input
								id="currentPassword"
								type="password"
								{...register("currentPassword")}
								placeholder="Enter current password"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor="newPassword">New Password</Label>
							<input
								id="newPassword"
								type="password"
								{...register("newPassword")}
								placeholder="Enter new password"
								className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
							/>
						</div>
						<div className="flex items-center gap-2">
							<input
								id="revokeSessions"
								type="checkbox"
								{...register("revokeSessions")}
								className="w-4 h-4"
							/>
							<Label htmlFor="revokeSessions">
								Log out from other sessions
							</Label>
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
