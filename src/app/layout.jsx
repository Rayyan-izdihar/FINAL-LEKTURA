import "./globals.css";

export const metadata = {
  title: "Lektura | Perpustakaan Katalog",
  description: "Sebuah website perpustakaan ruang baca",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-full flex flex-col antialiased">
        <main className="flex-1 w-full mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
