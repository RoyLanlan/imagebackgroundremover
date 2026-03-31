import { useState, useEffect } from 'react'

export default function TestPaypal() {
  const [status, setStatus] = useState('checking')
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
    script.async = true
    script.onload = () => {
      setStatus('PayPal SDK loaded!')
      
      // 延迟渲染，等待 DOM 就绪
      setTimeout(() => {
        if (window.paypal && window.paypal.Buttons) {
          window.paypal.Buttons({
            createOrder: function(data, actions) {
              return actions.order.create({
                purchase_units: [{ amount: { value: '9.99' } }]
              })
            },
            onApprove: function(data, actions) {
              alert('Payment success! Order ID: ' + data.orderID)
            },
            onError: function(err) {
              console.error('PayPal error:', err)
              alert('PayPal error: ' + err)
            }
          }).render('#paypal-button-container')
          setRendered(true)
        }
      }, 100)
    }
    script.onerror = () => {
      setStatus('PayPal SDK FAILED to load')
    }
    document.body.appendChild(script)
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>PayPal SDK Test</h1>
      <p>Status: <strong>{status}</strong></p>
      <p>Client ID: {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}</p>
      <p>Env: {process.env.PAYPAL_ENV}</p>
      <p>Rendered: {rendered ? 'Yes' : 'No'}</p>
      <div id="paypal-button-container" style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px', minHeight: '100px' }}>
        {rendered ? 'Buttons rendered' : 'Waiting for PayPal...'}
      </div>
    </div>
  )
}
