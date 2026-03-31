import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import Script from 'next/script'
import { useState } from 'react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [paypalReady, setPaypalReady] = useState(false)
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  return (
    <SessionProvider session={session}>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`}
        strategy="lazyOnload"
        onLoad={() => {
          console.log('PayPal SDK loaded successfully')
          setPaypalReady(true)
        }}
        onError={() => {
          console.error('PayPal SDK failed to load')
        }}
      />
      <Component {...pageProps} paypalReady={paypalReady} />
    </SessionProvider>
  )
}
