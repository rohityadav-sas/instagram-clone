export type Comment = {
	_id: string
	text: string
	author: {
		username: string
		image?: string
		emailVerified: boolean
	}
	post: {
		_id: string
	}
	likes: {
		username: string
		image?: string
		emailVerified: boolean
	}[]
	createdAt: string
}
