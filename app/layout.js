import "./globals.css";

export const metadata = {
  title: "DecoSpace",
  description: "Design Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* BRAND HEADER */}
        <header
          style={{ backgroundColor: "var(--parchment)" }}
          className="w-full px-10 py-8 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-5">
            {/* BIG LOGO */}
            <img
              src="/logo.png"
              alt="DecoSpace Logo"
              className="h-24 w-auto"
            />
          </div>
        </header>

        <main className="px-10 pb-20 pt-10">{children}</main>
      </body>
    </html>
  );
}
