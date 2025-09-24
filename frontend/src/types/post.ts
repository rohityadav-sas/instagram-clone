import { type Comment } from "./comment"

export type Post = {
	_id: string
	caption: string
	image: string
	author: {
		username: string
		profile_picture?: string
		isVerified: boolean
	}
	likes: { username: string; profile_picture?: string; isVerified: boolean }[]
	isBookmarked: boolean
	bookmarksCount: number
	createdAt: string
	comments: Comment[]
	commentsCount: number
}
