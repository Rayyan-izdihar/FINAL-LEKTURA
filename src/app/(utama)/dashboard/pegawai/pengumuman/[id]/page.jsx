import FormPengumuman from '@/components/pegawai/FormPengumuman';

export const metadata = { title: 'Ubah pengumuman' };

export default async function HalamanUbahPengumuman({ params }) {
    const { id } = await params;
    return <FormPengumuman pengumumanId={id} />;
}