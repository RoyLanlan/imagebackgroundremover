import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function Pricing() {
  const { data: session } = useSession()
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits))
    }
  }, [session])

  const buyCredits = async (amount) => {
    const res = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credits: amount }),
    })
    const { orderId } = await res.json()
    
    window.paypal.Buttons({
      createOrder: () => orderId,
      onApprove: async (data) => {
        await fetch('/api/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderID, credits: amount }),
        })
        alert('购买成功！')
        window.location.href = '/'
      }
    }).render('#paypal-button-container')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">请先登录</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">选择套餐</h1>
        <p className="text-center text-gray-600 mb-8">当前积分：{credits}</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2">100 积分</h2>
            <p className="text-4xl font-bold text-green-600 mb-4">$9.99</p>
            <button onClick={() => buyCredits(100)} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
              立即购买
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-500">
            <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded inline-block mb-2">推荐</div>
            <h2 className="text-2xl font-bold mb-2">500 积分</h2>
            <p className="text-4xl font-bold text-blue-600 mb-4">$29.99</p>
            <button onClick={() => buyCredits(500)} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
              立即购买
            </button>
          </div>
        </div>
        
        <div id="paypal-button-container" className="mt-8"></div>
      </div>
    </div>
  )
}
