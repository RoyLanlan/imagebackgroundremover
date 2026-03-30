import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import Script from 'next/script'
import { useState } from 'react'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [paypalReady, setPaypalReady] = useState(false)

  return (
    <SessionProvider session={session}>
      <Script
        src="https://www.paypal.com/sdk/js?client-id=AUSHJWGeMtLzEaWNP1ZX8d_qPUSqyLDSE7ZgzzBl0WCVmWBn5KBix7zjIPmSKzfIAuouOCOR69WFhQ7G&currency=USD"
        strategy="lazyOnload"
        onLoad={() => setPaypalReady(true)}
      />
      <Component {...pageProps} paypalReady={paypalReady} />
    </SessionProvider>
  )
}
