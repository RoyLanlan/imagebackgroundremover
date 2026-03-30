import { getCredits } from '../../../lib/credits'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  
  const credits = getCredits(session.user.email)
  res.json({ credits })
}
