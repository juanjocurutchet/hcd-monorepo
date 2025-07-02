export type Activity = {
  id: number
  title: string
  description: string
  date: Date
  image_url: string | null
  isPublished?: boolean
}

export type ActivityWithParticipants = Activity & {
  participants: string[]
}
