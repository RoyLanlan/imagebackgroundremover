import { createOrder } from '../../../lib/paypal'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  
  const { credits } = req.body
  const packages = {
    100: { price: '9.99', desc: '100 Credits' },
    500: { price: '29.99', desc: '500 Credits' },
  }
  
  const pkg = packages[credits]
  if (!pkg) return res.status(400).json({ error: 'Invalid package' })
  
  try {
    console.log('Creating order for:', pkg)
    const order = await createOrder(pkg.price, pkg.desc)
    console.log('Order created:', order)
    if (!order || !order.id) {
      throw new Error('Invalid order response: ' + JSON.stringify(order))
    }
    res.json({ orderId: order.id })
  } catch (error) {
    console.error('Create order error:', error)
    res.status(500).json({ error: error.message, details: error.stack })
  }
}
