import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [paypalReady, setPaypalReady] = useState(false)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    if (!clientId) return

    const script = document.createElement('script')
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
    script.async = true
    script.onload = () => {
      console.log('PayPal SDK loaded')
      setPaypalReady(true)
    }
    script.onerror = (e) => {
      console.error('PayPal SDK failed to load', e)
    }
    document.body.appendChild(script)
  }, [])

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} paypalReady={paypalReady} />
    </SessionProvider>
  )
}
