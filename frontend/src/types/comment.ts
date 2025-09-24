export type Comment = {
	_id: string
	text: string
	author: {
		username: string
		profile_picture?: string
		isVerified: boolean
	}
	post: {
		_id: string
	}
	likes: { username: string; profile_picture?: string; isVerified: boolean }[]
	createdAt: string
}
