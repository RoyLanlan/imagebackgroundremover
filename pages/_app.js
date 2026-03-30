import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import Script from 'next/script'
import { useState } from 'react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [paypalReady, setPaypalReady] = useState(false)

  return (
    <SessionProvider session={session}>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        strategy="lazyOnload"
        onLoad={() => setPaypalReady(true)}
      />
      <Component {...pageProps} paypalReady={paypalReady} />
    </SessionProvider>
  )
}
