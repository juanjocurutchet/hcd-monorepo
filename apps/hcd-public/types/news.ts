export interface News {
  id: number
  title: string
  content: string
  excerpt: string | null
  imageUrl: string | null
  publishedAt: Date | null
  authorId: number | null
  slug: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
