import { createBillingPlan, createSubscription } from '../../../lib/paypal'
import { getSession } from 'next-auth/react'

// 缓存 plan_id，避免重复创建
let cachedPlanId = null

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  
  try {
    if (!cachedPlanId) {
      const plan = await createBillingPlan()
      cachedPlanId = plan.id
    }
    
    const subscription = await createSubscription(cachedPlanId)
    const approvalUrl = subscription.links?.find(l => l.rel === 'approve')?.href
    
    res.json({ approvalUrl })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
