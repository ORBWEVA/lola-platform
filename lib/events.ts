import { SupabaseClient } from '@supabase/supabase-js'

export const logSessionEvent = async (
  supabase: SupabaseClient,
  params: {
    sessionId: string | null | undefined
    userId: string
    eventType: string
    metadata?: Record<string, unknown>
  }
) => {
  const { sessionId, userId, eventType, metadata } = params
  try {
    await supabase.from('session_events').insert({
      session_id: sessionId || null,
      user_id: userId,
      event_type: eventType,
      metadata: metadata || {},
    })
  } catch (e) {
    // Non-blocking — never fail a request because of event logging
    console.error('[events] Failed to log event:', eventType, e)
  }
}
