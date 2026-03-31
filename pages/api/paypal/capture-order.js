import { captureOrder } from '../../../lib/paypal'
import { addCredits } from '../../../lib/credits'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  
  const { orderId, credits } = req.body
  
  try {
    console.log('Capturing order:', orderId)
    const result = await captureOrder(orderId)
    console.log('Capture result:', JSON.stringify(result))
    
    // PayPal capture responses can have different structures
    const status = result.status || result.state
    
    if (status === 'COMPLETED' || status === 'CAPTURED') {
      addCredits(session.user.email, credits)
      console.log('Credits added for:', session.user.email, 'amount:', credits)
      res.json({ success: true, status })
    } else {
      console.error('Payment not completed, status:', status)
      res.status(400).json({ error: 'Payment not completed', result })
    }
  } catch (error) {
    console.error('Capture error:', error)
    res.status(500).json({ error: error.message })
  }
}
