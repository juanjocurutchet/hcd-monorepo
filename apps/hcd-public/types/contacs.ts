export type ContactFormData = {
  name: string
  email: string
  phone?: string
  organization?: string
  subject: string
  message: string
  type?: string
}

export type Contact = {
  id: number
  name: string
  email: string
  phone?: string
  organization?: string
  subject: string
  message: string
  type?: string
  createdAt: Date
  isRead: boolean
}
