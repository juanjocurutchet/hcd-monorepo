"use server"

import { insertContact, fetchAllContacts } from "@/services/contactService"
import { Contact, ContactFormData } from "@/types/contacs"


export async function submitContactForm(formData: ContactFormData) {
  try {
    const id = await insertContact(formData)
    return { success: true, id }
  } catch (error) {
    console.error("Error al guardar contacto:", error)
    return {
      success: false,
      error: "No se pudo enviar el formulario. Intente más tarde.",
    }
  }
}

export async function getAllContacts(): Promise<Contact[]> {
  try {
    return await fetchAllContacts()
  } catch (error) {
    console.error("Error al obtener contactos:", error)
    return []
  }
}
