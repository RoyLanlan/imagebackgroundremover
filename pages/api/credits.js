import { getServerSession } from 'next-auth'
import { authOptions } from 'next-auth'
import { getCredits } from '../../lib/credits'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.email) {
    return res.status(401).json({ error: '未登录' })
  }

  if (req.method === 'GET') {
    const credits = await getCredits(
      session.user.email,
      session.user.name,
      session.user.image
    )
    return res.json({ credits })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
