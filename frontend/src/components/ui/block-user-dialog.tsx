"use client"

import { useEffect, useState } from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useBlockUser } from "@/hooks/useBlockUser"

interface BlockUserDialogProps {
	children: React.ReactNode
	username: string
	isBlocked?: boolean
}

const BlockUserDialog = ({
	children,
	username,
	isBlocked = false,
}: BlockUserDialogProps) => {
	const [open, setOpen] = useState(false)
	const { blockUser, unblockUser, isLoading } = useBlockUser(() => {
		setOpen(false)
		setBlocked(!blocked)
	})
	const [blocked, setBlocked] = useState(isBlocked)

	useEffect(() => {
		setBlocked(isBlocked)
	}, [isBlocked])

	const handleBlock = () => {
		if (blocked) unblockUser(username)
		else blockUser(username)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="w-5 h-5 text-yellow-500" />
						{blocked ? "Unblock User" : "Block User"}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						{blocked ? (
							<>
								Are you sure you want to unblock <strong>@{username}</strong>?
								<br />
								<br />
								They will be able to see your posts and interact with you again.
							</>
						) : (
							<>
								Are you sure you want to block <strong>@{username}</strong>?
								<br />
								<br />
								They won't be able to find your profile, posts or story on
								Instagram. Instagram won't let them know you blocked them.
							</>
						)}
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
							variant={blocked ? "default" : "destructive"}
							onClick={handleBlock}
							className="flex-1 cursor-pointer"
							disabled={isLoading}
						>
							{isLoading
								? blocked
									? "Unblocking..."
									: "Blocking..."
								: blocked
								? "Unblock"
								: "Block"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default BlockUserDialog
