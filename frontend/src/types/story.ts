export type Story = {
	_id: string
	image: string
	image_public_id: string
	author: {
		_id: string
		username: string
		image?: string
	}
	viewers: string[]
	expiresAt: string
	createdAt: string
	updatedAt: string
	hasNewStory?: boolean
	isOwn?: boolean
	isViewed?: boolean
}
