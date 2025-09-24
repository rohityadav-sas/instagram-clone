import { type Post } from "./post"

export type User = {
	_id: string
	username: string
	email: string
	full_name?: string
	profile_picture: string
	bio: string
	gender: string
	isVerified?: boolean
	isFollowing?: boolean
	followersCount: number
	followingCount: number
	bookmarksCount: number
	posts: Post[]
	setUser: (user: Partial<User>) => void
	setUserAsync: (user: Partial<User>) => Promise<void>
	clearUser: () => void
}
