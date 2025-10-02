import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { type User } from "@/types/user"
import { Socket } from "socket.io-client"
import { lastMessage } from "@/types/conversation"

const useUserStore = create<User>()(
	persist(
		(set) => ({
			_id: "",
			name: "",
			username: "",
			email: "",
			image: "",
			bio: "",
			gender: "",
			emailVerified: false,
			followersCount: 0,
			followingCount: 0,
			bookmarksCount: 0,
			posts: [],
			setUser: (user) => set((state) => ({ ...state, ...user })),
			setUserAsync: async (user) => {
				set((state) => ({ ...state, ...user }))
			},
			clearUser: () =>
				set({
					username: "",
					name: "",
					email: "",
					image: null,
					bio: "",
					gender: "",
					emailVerified: false,
					followersCount: 0,
					followingCount: 0,
					bookmarksCount: 0,
					posts: [],
				}),
		}),
		{
			name: "user-storage",
			storage: createJSONStorage(() => localStorage),
		}
	)
)

const useOnlineUsersStore = create<{
	onlineUsers: string[]
	setOnlineUsers: (users: string[]) => void
}>((set) => ({
	onlineUsers: [],
	setOnlineUsers: (users) => set({ onlineUsers: users }),
}))

type UnreadState = {
	counts: Record<string, number>
	setCount: (chatId: string, count: number) => void
	increment: (chatId: string) => void
	clear: (chatId: string) => void
}

const useUnreadStore = create<UnreadState>((set) => ({
	counts: {},
	setCount: (chatId, count) =>
		set((state) => ({ counts: { ...state.counts, [chatId]: count } })),
	increment: (chatId) =>
		set((state) => ({
			counts: { ...state.counts, [chatId]: (state.counts[chatId] || 0) + 1 },
		})),
	clear: (chatId) =>
		set((state) => {
			const updated = { ...state.counts, [chatId]: 0 }
			return { counts: updated }
		}),
}))

const useSocketStore = create<{
	socket: Socket | null
	setSocket: (socket: Socket | null) => void
}>((set) => ({
	socket: null,
	setSocket: (socket) => set({ socket }),
}))

const useLastMessagesStore = create<{
	lastMessages: lastMessage
	setLastMessage: (lastMessage: lastMessage) => void
}>((set) => ({
	lastMessages: { existingChats: [], availableUsersForNewChat: [] },
	setLastMessage: (lastMessage) => set({ lastMessages: { ...lastMessage } }),
}))

const useSessionExpiredStore = create<{
	sessionExpired: boolean
	setSessionExpired: (expired: boolean) => void
}>((set) => ({
	sessionExpired: false,
	setSessionExpired: (expired) => set({ sessionExpired: expired }),
}))

export {
	useUserStore,
	useOnlineUsersStore,
	useUnreadStore,
	useSocketStore,
	useLastMessagesStore,
	useSessionExpiredStore,
}
