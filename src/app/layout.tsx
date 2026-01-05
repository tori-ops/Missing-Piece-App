import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Missing Piece - Wedding Planning",
  description: "Multi-tenant wedding planning SaaS",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts for branding support */}
        <link
          href="https://fonts.googleapis.com/css2?family=Allura&family=Brush+Script+MT&family=Cinzel&family=Cormorant+Garamond:wght@400;500;600;700&family=Crimson+Text&family=Dancing+Script&family=Dosis:wght@400;500;600;700&family=Great+Vibes&family=Inter:wght@400;500;600;700&family=Lato:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Roboto:wght@400;500;600;700&family=Sacramento&family=Tangerine&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
