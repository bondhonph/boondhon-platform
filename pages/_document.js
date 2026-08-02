import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="bn">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#090d16" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BOONDHON Chat" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </Head>
      <body className="bg-brand-dark text-white antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
