import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";


const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Sensai - AI career coach",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark
    }}>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${inter.className} dark`}
        >
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {/* Header */}
            <Header />
            <main className="min-h-screen overflow-x-hidden">
              {children}
            </main>
            <Toaster richColors />

            {/* Footer */}
            <footer className="bg-muted/50 py-12">
              <div className="container mx-auto px-4 text-center text-gray-200">
                <p>Made with 💗 by Salman</p>
              </div>
            </footer>
      </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
