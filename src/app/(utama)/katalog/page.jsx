import { Suspense } from 'react';
import KatalogClient from './KatalogClient';

export const metadata = { title: 'Katalog' };

// Halaman ini hanya pembungkus. Isinya ada di KatalogClient.js.
// Suspense dibutuhkan Next.js karena KatalogClient memakai useSearchParams.
export default function HalamanKatalog() {
    return (
        <Suspense fallback={<p className="py-10 text-tinta-lembut">Memuat katalog...</p>}>
            <KatalogClient />
        </Suspense>
    );
}