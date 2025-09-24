import { Plus } from "lucide-react"

const PostSkeleton = () => {
	return (
		<article className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-lg mx-auto animate-pulse">
			{/* Header Skeleton */}
			<div className="p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-gray-300 rounded-full"></div>
						<div className="h-4 bg-gray-300 rounded w-24"></div>
					</div>
					<div className="w-5 h-5 bg-gray-300 rounded"></div>
				</div>
			</div>

			{/* Image Skeleton */}
			<div className="relative aspect-square bg-gray-300"></div>

			{/* Content Skeleton */}
			<div className="p-4">
				{/* Actions */}
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-4">
						<div className="w-6 h-6 bg-gray-300 rounded"></div>
						<div className="w-6 h-6 bg-gray-300 rounded"></div>
						<div className="w-6 h-6 bg-gray-300 rounded"></div>
					</div>
					<div className="w-6 h-6 bg-gray-300 rounded"></div>
				</div>

				{/* Likes */}
				<div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>

				{/* Caption */}
				<div className="space-y-2 mb-2">
					<div className="h-4 bg-gray-300 rounded w-full"></div>
					<div className="h-4 bg-gray-300 rounded w-3/4"></div>
				</div>

				{/* Comments */}
				<div className="h-3 bg-gray-300 rounded w-32 mb-2"></div>

				{/* Time */}
				<div className="h-3 bg-gray-300 rounded w-16 mb-4"></div>

				{/* Comment input */}
				<div className="pt-4 border-t border-gray-100">
					<div className="h-4 bg-gray-300 rounded w-28"></div>
				</div>
			</div>
		</article>
	)
}

const StoriesSkeleton = () => {
	return (
		<div className="py-4 px-4">
			<div className="flex gap-4 overflow-x-auto scrollbar-hide">
				<div className="flex flex-col items-center gap-1 flex-shrink-0 p-1">
					<div className="relative p-[2px] rounded-full bg-gray-200">
						<div className="bg-white rounded-full p-[2px]">
							<div className="relative w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:bg-gray-50 transition-colors">
								<Plus size={24} className="text-gray-500" />
							</div>
						</div>
					</div>
					<span className="text-xs text-gray-600 max-w-[70px] truncate font-medium">
						Your story
					</span>
				</div>

				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className="flex flex-col items-center gap-1 flex-shrink-0 p-1"
					>
						<div className="relative p-[2px] rounded-full bg-gray-300 animate-pulse">
							<div className="bg-white rounded-full p-[2px]">
								<div className="w-16 h-16 rounded-full bg-gray-200"></div>
							</div>
						</div>
						<div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
					</div>
				))}
			</div>
		</div>
	)
}

export { PostSkeleton, StoriesSkeleton }
