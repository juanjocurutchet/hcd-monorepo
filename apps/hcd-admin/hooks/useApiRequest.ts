import { useSession } from "next-auth/react"

export function useApiRequest() {
  const { data: session, status } = useSession()

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    if (status !== "authenticated" || !session) {
      throw new Error("No hay sesión activa")
    }

    const isFormData = options.body instanceof FormData
    const defaultHeaders = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: defaultHeaders
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Error ${response.status}`)
    }

    return response
  }

  return { apiRequest, isAuthenticated: status === "authenticated" }
}