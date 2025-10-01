import { type Comment } from "./comment"

export type Post = {
	_id: string
	caption: string
	image: string
	author: {
		username: string
		image?: string
		emailVerified: boolean
	}
	likes: {
		username: string
		image?: string
		emailVerified: boolean
	}[]
	isBookmarked: boolean
	bookmarksCount: number
	createdAt: string
	comments: Comment[]
	commentsCount: number
}
