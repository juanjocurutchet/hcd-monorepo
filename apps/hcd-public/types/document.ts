export type DocumentType = {
  id: number
  title: string
  type: string
  number: string
  published_at: Date
  isPublished: boolean
  file_url?: string
  description?: string
}