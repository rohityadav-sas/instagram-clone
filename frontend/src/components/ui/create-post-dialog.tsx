"use client"

import React from "react"
import toast from "react-hot-toast"
import axios_instance from "@/config/axios"
import { PlusSquare } from "lucide-react"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useQueryClient } from "@tanstack/react-query"

const CreatePostDialog = () => {
	const [caption, setCaption] = React.useState("")
	const [image, setImage] = React.useState<File | null>(null)
	const [preview, setPreview] = React.useState<string>("")
	const [isLoading, setIsLoading] = React.useState(false)
	const [isOpen, setIsOpen] = React.useState(false)
	const queryClient = useQueryClient()

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setImage(file)
			const reader = new FileReader()
			reader.onloadend = () => {
				setPreview(reader.result as string)
			}
			reader.readAsDataURL(file)
		}
	}

	const handleCreatePost = async () => {
		if (!image) {
			toast.error("Please select an image")
			return
		}
		if (isLoading) return
		setIsLoading(true)

		const formData = new FormData()
		formData.append("image", image)
		formData.append("caption", caption)

		const fn = async () => {
			const response = await axios_instance.post("/posts/create", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			if (!response.data.success) throw new Error(response.data.message)

			if (response.data.success) {
				setCaption("")
				setImage(null)
				setPreview("")
				setIsOpen(false)
				queryClient.refetchQueries({ queryKey: ["profile-posts"] })
			}
		}
		toast
			.promise(fn(), {
				loading: "Creating post...",
				success: "Post created successfully!",
				error: (err) => err.message || "Something went wrong",
			})
			.finally(() => setIsLoading(false))
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<div className="flex gap-4 p-3 w-full cursor-pointer rounded-md items-center transition-colors duration-200 hover:bg-gray-200">
					<span className="w-6 h-6 flex items-center justify-center">
						<PlusSquare />
					</span>
					<span className="text-base">Create</span>
				</div>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Create New Post</DialogTitle>
					<DialogDescription>
						Share a photo with your followers
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<Label htmlFor="image">Select Image</Label>
						<Input
							id="image"
							type="file"
							accept="image/*"
							onChange={handleImageChange}
							className="mt-1"
						/>
					</div>

					{preview && (
						<div className="flex justify-center">
							<img
								src={preview}
								alt="Preview"
								className="max-w-full h-48 object-cover rounded-md"
							/>
						</div>
					)}

					<div>
						<Label htmlFor="caption">Caption</Label>
						<Input
							id="caption"
							placeholder="Write a caption..."
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
							className="mt-1"
						/>
					</div>

					<Button
						onClick={handleCreatePost}
						disabled={isLoading}
						className="w-full cursor-pointer"
					>
						{isLoading ? "Creating..." : "Create Post"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default CreatePostDialog
