import { captureOrder } from '../../../lib/paypal'
import { addCredits } from '../../../lib/credits'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  
  const { orderId, credits } = req.body
  
  try {
    const result = await captureOrder(orderId)
    if (result.status === 'COMPLETED') {
      addCredits(session.user.email, credits)
      res.json({ success: true })
    } else {
      res.status(400).json({ error: 'Payment failed' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
