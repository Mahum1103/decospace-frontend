import "./globals.css";

export const metadata = {
  title: "DecoSpace",
  description: "Your hub for all your styling needs"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
