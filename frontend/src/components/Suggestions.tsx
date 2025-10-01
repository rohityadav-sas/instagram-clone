"use client"
import Image from "next/image"
import { CheckCircle } from "lucide-react"

import { useUserStore } from "@/store/store"
import { useSuggestedUsers } from "@/hooks/useSuggestedUsers"
import SuggestedAccountItem from "./ui/suggested-account-item"
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { LoginForm } from "./LoginForm"

const CurrentUser = () => {
	let logged_user = useUserStore((state) => state)
	return (
		<div className="flex items-center gap-3 py-4">
			<div className="relative flex-shrink-0">
				<Image
					src={logged_user.image || "/default-avatar.svg"}
					alt={`${logged_user.username}'s avatar`}
					width={40}
					height={40}
					style={{
						objectFit: "cover",
						borderRadius: "50%",
						aspectRatio: "1 / 1",
					}}
				/>
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-1">
					<span className="text-sm font-semibold text-gray-900 truncate">
						{logged_user.username || logged_user.name}
					</span>
					{logged_user.emailVerified && (
						<CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
					)}
				</div>
				<div className="text-xs text-gray-500 truncate">
					{logged_user.email}
				</div>
			</div>
			<Dialog>
				<DialogTrigger className="text-xs cursor-pointer font-semibold text-blue-500 hover:text-blue-600 transition-colors">
					Switch
				</DialogTrigger>
				<DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-4xl p-0 rounded-xl">
					<DialogTitle className="sr-only">Switch</DialogTitle>
					<LoginForm />
				</DialogContent>
			</Dialog>
		</div>
	)
}

const Suggestions = () => {
	const { data: suggested_accounts, isLoading } = useSuggestedUsers()
	let logged_user = useUserStore((state) => state)

	return (
		<div className="w-96 pt-8 px-6 border-l border-gray-200 bg-white">
			<div>
				{/* User profile skeleton */}
				{logged_user ? (
					<CurrentUser />
				) : (
					<div className="flex items-center gap-3 py-4">
						<div className="w-11 h-11 bg-gray-300 rounded-full flex-shrink-0"></div>
						<div className="flex-1 min-w-0">
							<div className="h-3.5 bg-gray-300 rounded w-20 mb-1"></div>
							<div className="h-3 bg-gray-300 rounded w-16"></div>
						</div>
						<div className="h-3 bg-gray-300 rounded w-12"></div>
					</div>
				)}

				{/* Suggestions skeleton - matches real suggestions section */}
				<div className="mt-6">
					{/* Header skeleton */}
					<div className="flex items-center justify-between mb-4">
						<span className="text-sm font-semibold text-gray-500">
							Suggested for you
						</span>
					</div>

					{/* Suggested accounts skeleton */}
					{isLoading ? (
						<div className="space-y-1 animate-pulse">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="flex items-center gap-3 py-2">
									<div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
									<div className="flex-1 min-w-0">
										<div className="h-3.5 bg-gray-300 rounded w-16 mb-1"></div>
										<div className="h-3 bg-gray-300 rounded w-20"></div>
									</div>
									<div className="h-3 bg-gray-300 rounded w-14"></div>
								</div>
							))}
						</div>
					) : suggested_accounts && suggested_accounts.length > 0 ? (
						<div className="space-y-1">
							{suggested_accounts.slice(0, 5).map((account) => (
								<SuggestedAccountItem
									key={account._id || account.username}
									account={account}
								/>
							))}
						</div>
					) : (
						<div className="text-center py-4 text-gray-500 text-xs">
							No suggestions available
						</div>
					)}
				</div>

				{/* Footer skeleton */}
				<div className="mt-8 pt-6 border-t border-gray-100">
					<div className="text-xs text-gray-400 space-y-1">
						<div className="flex flex-wrap gap-2">
							<a href="#" className="hover:underline">
								About
							</a>
							<span>·</span>
							<a href="#" className="hover:underline">
								Help
							</a>
							<span>·</span>
							<a href="#" className="hover:underline">
								Press
							</a>
							<span>·</span>
							<a href="#" className="hover:underline">
								API
							</a>
						</div>
						<div className="flex flex-wrap gap-2">
							<a href="#" className="hover:underline">
								Jobs
							</a>
							<span>·</span>
							<a href="#" className="hover:underline">
								Privacy
							</a>
							<span>·</span>
							<a href="#" className="hover:underline">
								Terms
							</a>
						</div>
						<div className="text-gray-400">© 2025 Instagram Clone</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Suggestions
