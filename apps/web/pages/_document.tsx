import { Html, Head, Main, NextScript } from "next/document";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { GTM_ID, GTM_SCRIPT } from "../lib/gtm"; // Ajusta la ruta según la ubicación de tu archivo gtm.js

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* DNS Prefetch for Firebase/Firestore */}
        <link rel="manifest" href="/manifest.json" />

        {/* Facebook Domain Verification */}
        <meta
          name="facebook-domain-verification"
          content="qdbgr3loscc65oxwhxonu5u1zgcwof"
        />

        <link rel="dns-prefetch" href="https://firebase.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />

        {/* Preconnect to Firebase/Firestore */}
        <link rel="preconnect" href="https://firebase.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />

        {/* Google Identity Services for OAuth */}
        <script src="https://accounts.google.com/gsi/client" async defer />

        <script
          dangerouslySetInnerHTML={{
            __html: GTM_SCRIPT,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`,
          }}
        />
        <script async src="https://r.wdfl.co/rw.js" data-rewardful="8ee8ed" />
        {/* <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        /> */}

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1472114687278073');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* Google tag (gtag.js) - AdWords */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-16900342389"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-16900342389');
            `,
          }}
        />
      </Head>
      <SpeedInsights />
      <body className="antialiased">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
