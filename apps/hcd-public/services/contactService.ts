import { sql } from "@/lib/db"
import { Contact, ContactFormData } from "@/types/contacs"


export async function insertContact(formData: ContactFormData): Promise<number> {
  const result = await sql`
    INSERT INTO contact_messages (
      name, email, phone, organization, subject, message, type
    ) VALUES (
      ${formData.name},
      ${formData.email},
      ${formData.phone || null},
      ${formData.organization || null},
      ${formData.subject},
      ${formData.message},
      ${formData.type || "contact"}
    )
    RETURNING id
  `
  return result[0]?.id
}

export async function fetchAllContacts(): Promise<Contact[]> {
  const result = await sql`
    SELECT
      id,
      name,
      email,
      phone,
      organization,
      subject,
      message,
      type,
      created_at as "createdAt",
      is_read as "isRead"
    FROM contact_messages
    ORDER BY created_at DESC
  `
  return result as Contact[]
}
