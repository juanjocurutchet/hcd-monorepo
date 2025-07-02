import { sql } from "@/lib/db"
import { Activity, ActivityWithParticipants } from "@/types/activity"

const SELECT_FIELDS = sql`
  id, title, description, date, image_url
`

export async function fetchLatestActivities(limit = 4): Promise<Activity[]> {
  const result = await sql`
    SELECT ${SELECT_FIELDS}
    FROM activities
    WHERE is_published = true
    ORDER BY date DESC
    LIMIT ${limit}
  `
  return result as unknown as Activity[]
}

export async function fetchAllActivities(): Promise<Activity[]> {
  const result = await sql`
    SELECT ${SELECT_FIELDS}, is_published as "isPublished"
    FROM activities
    ORDER BY date DESC
  `
  return result as unknown as Activity[]
}

export async function fetchActivityWithParticipants(activityId: number): Promise<ActivityWithParticipants | null> {
  const result = await sql`
    SELECT ${SELECT_FIELDS}
    FROM activities
    WHERE id = ${activityId} AND is_published = true
  `
  if (!result.length) return null

  const activity = result[0] as unknown as Activity

  const participants = await sql`
    SELECT cm.name
    FROM activity_participants ap
    JOIN council_members cm ON ap.council_member_id = cm.id
    WHERE ap.activity_id = ${activityId}
  `

  return {
    ...activity,
    participants: participants.map((p) => p.name),
  }
}
