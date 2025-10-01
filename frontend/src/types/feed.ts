// User data interface - matches backend User model
export interface UserData {
	_id: string
	username: string
	email: string
	image?: string
	bio?: string
	gender?: string
	followers: string[]
	following: string[]
	bookmarks: string[]
	createdAt: string
	updatedAt: string
}

// Comment data interface - matches backend Comment model
export interface CommentData {
	_id: string
	text: string
	author: {
		_id: string
		username: string
		image?: string
	}
	post: string
	likes: string[]
	createdAt: string
	updatedAt: string
}
