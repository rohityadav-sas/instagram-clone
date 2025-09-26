"use client"
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog"
import { ReactNode, useState } from "react"
import { Button } from "./button"
import axios_instance from "@/config/axios"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

const DeleteUserDialog = ({ children }: { children: ReactNode }) => {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)

	const handleDelete = async () => {
		setIsLoading(true)
		const fn = async () => {
			const { data } = await axios_instance.delete("/users/delete")
			if (!data.success) throw new Error(data.message || "Something went wrong")
			return data.message
		}
		toast.promise(fn(), {
			loading: "Deleting account...",
			success: (message) => {
				setIsLoading(false)
				setOpen(false)
				router.push("/login")
				return message
			},
			error: (err) => err.message || "Something went wrong",
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogTitle className="sr-only">Delete User</DialogTitle>
				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						<>
							Are you sure you want to delete your account? This action is
							irreversible. All your posts, stories, and comments will be
							permanently removed from Instagram.
						</>
					</p>

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
							type="button"
							variant={"destructive"}
							onClick={handleDelete}
							className="flex-1 cursor-pointer"
							disabled={isLoading}
						>
							{isLoading ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default DeleteUserDialog
