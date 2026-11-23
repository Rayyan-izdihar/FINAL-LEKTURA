import FormBuku from '@/components/pegawai/FormBuku';

export const metadata = { title: 'Ubah buku' };

// Di Next.js 16, params berupa Promise, jadi harus di-await.
export default async function HalamanUbahBuku({ params }) {
    const { id } = await params;
    return <FormBuku bukuId={id} />;
}