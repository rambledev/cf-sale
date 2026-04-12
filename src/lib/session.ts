import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions } from './session-options'

export type { SessionData } from './session-options'
export { sessionOptions } from './session-options'

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<import('./session-options').SessionData>(cookieStore, sessionOptions)
}
