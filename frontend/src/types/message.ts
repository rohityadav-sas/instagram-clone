export type Message = {
	_id: string
	sender: string
	message: string
	chat?: string
	createdAt: string
	read_by: string[]
}
