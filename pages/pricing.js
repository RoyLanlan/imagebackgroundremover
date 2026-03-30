import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

const PACKAGES = {
  100: { price: '$9.99', label: '100 积分' },
  500: { price: '$29.99', label: '500 积分' },
}

export default function Pricing({ paypalReady }) {
  const { data: session } = useSession()
  const [credits, setCredits] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits))
    }
  }, [session])

  useEffect(() => {
    if (!selectedPackage || !paypalReady || rendered) return

    const container = document.getElementById('paypal-button-container')
    if (!container) return
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
        alert(`购买成功！已添加 ${selectedPackage} 积分`)
        window.location.href = '/'
      },
      onError: (err) => {
        console.error('PayPal error:', err)
        alert('支付失败，请重试')
      }
    }).render('#paypal-button-container')
    setRendered(true)
  }, [selectedPackage, paypalReady])

  const handleSelect = (amount) => {
    setRendered(false)
    setSelectedPackage(amount)
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

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`bg-white p-8 rounded-xl shadow-lg cursor-pointer border-2 transition ${selectedPackage === 100 ? 'border-green-500' : 'border-transparent'}`}
            onClick={() => handleSelect(100)}>
            <h2 className="text-2xl font-bold mb-2">100 积分</h2>
            <p className="text-4xl font-bold text-green-600 mb-4">$9.99</p>
            <p className="text-gray-500 text-sm">每次处理消耗 1 积分</p>
          </div>

          <div className={`bg-white p-8 rounded-xl shadow-lg cursor-pointer border-2 transition ${selectedPackage === 500 ? 'border-blue-500' : 'border-transparent'}`}
            onClick={() => handleSelect(500)}>
            <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded inline-block mb-2">推荐</div>
            <h2 className="text-2xl font-bold mb-2">500 积分</h2>
            <p className="text-4xl font-bold text-blue-600 mb-4">$29.99</p>
            <p className="text-gray-500 text-sm">节省 40%</p>
          </div>
        </div>

        {selectedPackage && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-center">
              支付 {PACKAGES[selectedPackage].price} 购买 {PACKAGES[selectedPackage].label}
            </h3>
            {paypalReady ? (
              <div id="paypal-button-container"></div>
            ) : (
              <p className="text-center text-gray-500">PayPal 加载中...</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
