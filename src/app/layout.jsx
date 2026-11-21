import { Fraunces, Montserrat } from 'next/font/google';
import './globals.css';

export const metadata = {
    title: 'Lektura | Katalog Buku',
    description: 'Sistem manajemen perpustakaan kampus Lektura.',
};

// Fraunces untuk judul, Montserrat untuk teks biasa.
const fraunces = Fraunces({ 
    subsets: ['latin'], 
    variable: '--font-fraunces' 
});

const montserrat = Montserrat({ 
    subsets: ['latin'], 
    variable: '--font-montserrat' 
});


export default function RootLayout({ children }) {
    return (
        <html lang="id" className={`${fraunces.variable} ${montserrat.variable}`}>
            <body className="min-h-screen antialiased">{children}</body>
        </html>
    );
}