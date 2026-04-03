import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

const PACKAGES = {
  100: { price: '9.99', label: '100 积分' },
  500: { price: '29.99', label: '500 积分' },
}

export default function Pricing() {
  const { data: session } = useSession()
  const [credits, setCredits] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits))
    }
    // 恢复用户之前选择的套餐（防止刷新后丢失）
    const saved = sessionStorage.getItem('pendingPackage')
    if (saved) setSelectedPackage(parseInt(saved))
  }, [session])

  const handlePaypalCheckout = async () => {
    if (!selectedPackage) return
    
    setError('')
    setLoading(true)
    
    try {
      // 创建订单
      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits: selectedPackage }),
      })
      const data = await res.json()
      
      if (!res.ok || !data.orderId) {
        throw new Error(data.error || '创建订单失败')
      }
      
      // 保存选中的套餐到 sessionStorage，防止 PayPal 返回后 state 丢失
      sessionStorage.setItem('pendingPackage', selectedPackage)
      sessionStorage.setItem('paypalOrderId', data.orderId)

      // 重定向到 PayPal Checkout
      const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${data.orderId}`
      window.location.href = paypalUrl
      
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  // 检查 URL 中是否有 PayPal 返回的参数
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const PayerID = urlParams.get('PayerID')

    if (token && PayerID && session) {
      const pendingPackage = parseInt(sessionStorage.getItem('pendingPackage') || '0')

      if (pendingPackage > 0) {
        const capturePayment = async () => {
          try {
            const res = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: token, credits: pendingPackage }),
            })
            const result = await res.json()

            if (res.ok && result.success) {
              alert(`购买成功！已添加 ${pendingPackage} 积分`)
              // 清除缓存
              sessionStorage.removeItem('pendingPackage')
              sessionStorage.removeItem('paypalOrderId')
              // 清除 URL 参数
              window.history.replaceState({}, '', '/pricing')
              // 刷新积分显示
              fetch('/api/credits').then(r => r.json()).then(d => setCredits(d.credits))
            } else {
              setError(result.error || '支付失败')
            }
          } catch (err) {
            setError(err.message)
          }
        }

        capturePayment()
      }
    }
  }, [session])

  const handleSelect = (amount) => {
    setError('')
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
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">错误</p>
                <p>{error}</p>
              </div>
            )}
            <div className="text-center">
              <button
                onClick={handlePaypalCheckout}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50"
              >
                {loading ? '跳转中...' : '使用 PayPal 支付'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
