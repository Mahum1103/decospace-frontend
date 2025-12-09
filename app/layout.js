import "./globals.css";

export const metadata = {
  title: "DecoSpace",
  description: "Your hub for your styling needs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        {/* Brand Header */}
        <header className="w-full px-6 py-5 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* LOGO SLOT — you will drop your image here later */}
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              D
            </div>
            <span className="font-bold text-lg tracking-tight">DecoSpace</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
