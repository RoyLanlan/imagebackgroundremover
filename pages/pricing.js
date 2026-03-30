import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Pricing() {
  const { data: session } = useSession()
  const router = useRouter()
  const [credits, setCredits] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState(null)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits))
    }
  }, [session])

  useEffect(() => {
    if (selectedPackage && window.paypal) {
      const container = document.getElementById('paypal-button-container')
      container.innerHTML = ''
      
      window.paypal.Buttons({
        createOrder: async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credits: selectedPackage }),
          })
          const { orderId } = await res.json()
          return orderId
        },
        onApprove: async (data) => {
          await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID, credits: selectedPackage }),
          })
          alert('购买成功！')
          router.push('/')
        }
      }).render('#paypal-button-container')
    }
  }, [selectedPackage])

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
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-2">100 积分</h2>
            <p className="text-4xl font-bold text-green-600 mb-4">$9.99</p>
            <button onClick={() => setSelectedPackage(100)} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
              选择此套餐
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-blue-500">
            <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded inline-block mb-2">推荐</div>
            <h2 className="text-2xl font-bold mb-2">500 积分</h2>
            <p className="text-4xl font-bold text-blue-600 mb-4">$29.99</p>
            <button onClick={() => setSelectedPackage(500)} className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
              选择此套餐
            </button>
          </div>
        </div>
        
        {selectedPackage && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-center">使用 PayPal 支付</h3>
            <div id="paypal-button-container"></div>
          </div>
        )}
      </div>
    </div>
  )
}
