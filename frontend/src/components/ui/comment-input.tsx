import { useState } from "react"

interface CommentInputProps {
	className?: string
	postId?: string
	addComment?: (commentText: string) => void
	ref?: React.RefObject<HTMLInputElement | null>
}

const CommentInput = ({
	className = "flex items-center gap-3 w-full",
	addComment,
	ref,
}: CommentInputProps) => {
	const [comment, setComment] = useState("")

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setComment(e.target.value)
	}

	const handlePostComment = () => {
		if (!comment.trim()) return

		const commentText = comment.trim()
		setComment("")

		// Use the addComment function from the hook which handles API call and caching
		if (addComment) {
			addComment(commentText)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handlePostComment()
	}

	return (
		<div className={className}>
			<input
				type="text"
				placeholder="Add a comment..."
				value={comment}
				className="flex-1 text-sm border-none outline-none focus:outline-none bg-transparent placeholder-gray-400"
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				ref={ref}
			/>
			{comment.trim() && (
				<button
					className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
					onClick={handlePostComment}
				>
					Post
				</button>
			)}
		</div>
	)
}

export default CommentInput
