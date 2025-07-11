import "../globals.css";
import NextAuthSessionProvider from "@/components/SessionProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
} 