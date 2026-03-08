import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "invoicr",
  description: "Invoice generator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 min-h-screen">
        <nav className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
            <Link href="/" className="text-lg font-bold tracking-tight">
              invoicr
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/" className="text-gray-600 hover:text-black">
                Invoices
              </Link>
              <Link href="/clients" className="text-gray-600 hover:text-black">
                Clients
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-black">
                Settings
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
