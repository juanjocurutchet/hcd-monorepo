"use server"

import {
  fetchLatestActivities,
  fetchAllActivities,
  fetchActivityWithParticipants,
} from "@/services/activityService"

import { Activity, ActivityWithParticipants } from "@/types/activity"

export async function getLatestActivities(limit = 4): Promise<Activity[]> {
  try {
    return await fetchLatestActivities(limit)
  } catch (error) {
    console.error("Error al obtener actividades recientes:", error)
    return []
  }
}

export async function getAllActivities(): Promise<Activity[]> {
  try {
    return await fetchAllActivities()
  } catch (error) {
    console.error("Error al obtener todas las actividades:", error)
    return []
  }
}

export async function getActivityWithParticipants(activityId: number): Promise<ActivityWithParticipants | null> {
  try {
    return await fetchActivityWithParticipants(activityId)
  } catch (error) {
    console.error("Error al obtener la actividad:", error)
    return null
  }
}
