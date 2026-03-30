import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import Script from 'next/script'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Script src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`} />
      <Component {...pageProps} />
    </SessionProvider>
  )
}
