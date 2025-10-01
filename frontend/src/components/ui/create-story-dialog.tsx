"use client"

import { useState, useRef } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { useStories } from "@/hooks/useStories"

interface CreateStoryDialogProps {
	children: React.ReactNode
}

const CreateStoryDialog = ({ children }: CreateStoryDialogProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [selectedImage, setSelectedImage] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const { createStory, isCreating } = useStories()

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setSelectedImage(file)
			const url = URL.createObjectURL(file)
			setPreviewUrl(url)
		}
	}

	const handleShare = () => {
		if (selectedImage) {
			createStory(selectedImage)
			handleClose()
		}
	}

	const handleClose = () => {
		setIsOpen(false)
		setSelectedImage(null)
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl)
			setPreviewUrl(null)
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const triggerFileInput = () => {
		fileInputRef.current?.click()
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="p-0 gap-0 max-w-md">
				<DialogTitle className="sr-only">Create Story</DialogTitle>

				<div className="p-4 border-b">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">Create story</h2>
						<button
							onClick={handleClose}
							className="p-2 hover:bg-gray-100 rounded-full transition-colors"
						>
							<X size={20} />
						</button>
					</div>
				</div>

				<div className="p-4">
					{!selectedImage ? (
						<div
							className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
							onClick={triggerFileInput}
						>
							<div className="flex flex-col items-center gap-4">
								<div className="p-4 bg-gray-100 rounded-full">
									<Upload size={32} className="text-gray-600" />
								</div>
								<div>
									<p className="text-lg font-medium text-gray-700">
										Select photo
									</p>
									<p className="text-sm text-gray-500 mt-1">or drag and drop</p>
								</div>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{/* Preview */}
							<div className="relative aspect-[9/16] max-h-96 bg-gray-100 rounded-lg overflow-hidden">
								{previewUrl && (
									<Image
										src={previewUrl}
										alt="Story preview"
										fill
										className="object-cover"
									/>
								)}
							</div>

							{/* Actions */}
							<div className="flex gap-3">
								<button
									onClick={triggerFileInput}
									className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Change photo
								</button>
								<button
									onClick={handleShare}
									disabled={isCreating}
									className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{isCreating ? "Sharing..." : "Share to story"}
								</button>
							</div>
						</div>
					)}

					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileSelect}
						className="hidden"
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default CreateStoryDialog
