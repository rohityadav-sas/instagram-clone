// Suggested account data interface - matches backend User model
export interface SuggestedAccountData {
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
	// Additional UI-specific fields
	emailVerified?: boolean
	followedBy?: string[] // usernames of mutual followers
	isFollowing?: boolean
	fullName?: string // computed from bio or username
}

// Suggestions component props interface
export interface SuggestionsProps {
	accounts?: SuggestedAccountData[]
	isLoading?: boolean
	onFollow?: (accountId: string) => void
	onUnfollow?: (accountId: string) => void
	onViewProfile?: (username: string) => void
}

// User profile data interface (for current user) - matches backend User model
export interface UserProfile {
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
	// Additional UI-specific fields
	emailVerified?: boolean
	followersCount?: number // computed from followers.length
	followingCount?: number // computed from following.length
	postsCount?: number // computed from user's posts
}
