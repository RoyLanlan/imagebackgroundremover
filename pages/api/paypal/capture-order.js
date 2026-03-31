import { captureOrder } from '../../../lib/paypal'
import { addCredits } from '../../../lib/credits'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  
  try {
    // 使用 JWT token 验证 session
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET
    })
    
    console.log('Session token:', token ? 'exists' : 'null')
    
    if (!token || !token.email) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No valid session',
        hint: 'Make sure NEXTAUTH_SECRET is configured correctly'
      })
    }
    
    const { orderId, credits } = req.body
    
    console.log('Capturing order:', orderId, 'for user:', token.email)
    const result = await captureOrder(orderId)
    console.log('Capture result:', JSON.stringify(result))
    
    // PayPal capture responses can have different structures
    const status = result.status || result.state
    
    if (status === 'COMPLETED' || status === 'CAPTURED') {
      addCredits(token.email, credits)
      console.log('Credits added for:', token.email, 'amount:', credits)
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
