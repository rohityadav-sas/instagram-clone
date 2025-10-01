"use client"
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog"
import { ReactNode, useState } from "react"
import { Button } from "./button"
import toast from "react-hot-toast"
import { authClient } from "@/auth/auth-client"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/store"

const DeleteUserDialog = ({ children }: { children: ReactNode }) => {
	const [isLoading, setIsLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const [emailSent, setEmailSent] = useState(false)
	const clearUser = useUserStore((state) => state.clearUser)
	const router = useRouter()

	const handleDelete = async () => {
		setIsLoading(true)
		const fn = async () => {
			const { error } = await authClient.deleteUser()
			if (error) throw new Error(error.message)
			setTimeout(() => {
				clearUser()
				router.push("/login")
			}, 5 * 1000)
			return "Verification email sent. Please check your mail."
		}
		toast.promise(fn(), {
			loading: "Sending verification email...",
			success: (message) => {
				setIsLoading(false)
				setEmailSent(true)
				return message
			},
			error: (err) => err.message || "Something went wrong",
		})
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent>
				<DialogTitle>
					{emailSent ? "Check Your Email" : "Delete User"}
				</DialogTitle>

				<div className="space-y-4">
					{emailSent ? (
						<p className="text-sm text-gray-600">
							A verification email has been sent to your inbox. Please click the
							link in the email to confirm account deletion.
						</p>
					) : (
						<p className="text-sm text-gray-600">
							Are you sure you want to delete your account? This action is
							irreversible. All your posts, stories, and comments will be
							permanently removed from Instagram.
						</p>
					)}

					<div className="flex gap-3 pt-4">
						{!emailSent && (
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								className="flex-1 cursor-pointer"
								disabled={isLoading}
							>
								Cancel
							</Button>
						)}

						<Button
							type="button"
							variant={emailSent ? "default" : "destructive"}
							onClick={() => {
								if (emailSent) {
									setOpen(false)
								} else {
									handleDelete()
								}
							}}
							className="flex-1 cursor-pointer"
							disabled={isLoading}
						>
							{emailSent ? "Close" : isLoading ? "Deleting..." : "Delete"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default DeleteUserDialog
