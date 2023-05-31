import '@/styles/globals.css'
import '@/styles/bulma.min.css'
import Layout from '../../components/Layout'

export default function App({ Component, pageProps }) {
  return (
    <Layout pageProps={pageProps}>
      <Component {...pageProps} />
    </Layout>
  );
}
