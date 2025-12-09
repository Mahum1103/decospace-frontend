import "./globals.css";

export const metadata = {
  title: "DecoSpace",
  description: "Design Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F6F1E9] text-[#1A1A1A]">
        {/* Brand Header */}
        <header className="w-full px-10 py-6 bg-[#F6F1E9] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="DecoSpace Logo"
              className="h-12 w-auto"
            />
          </div>
        </header>

        <main className="px-10 pb-20">{children}</main>
      </body>
    </html>
  );
}
