export type existingChat = {
	_id: string
	members: {
		_id: string
		username: string
		image: string
		emailVerified: boolean
	}[]
	last_message: {
		_id: string
		message: string
		createdAt: string
	}
	createdAt: string
	unreadCount: number
}

export type availableUserForNewChat = {
	_id: string
	username: string
	image: string
	emailVerified: boolean
}

export type lastMessage = {
	existingChats: existingChat[]
	availableUsersForNewChat: availableUserForNewChat[]
}
