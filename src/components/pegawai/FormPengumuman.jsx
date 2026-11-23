'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import KolomForm from '@/components/KolomForm';
import { kirimAksi } from '@/lib/aksi';
import { kelasInput, kelasPanel, kelasTombol } from '@/lib/gaya';

const KATEGORI = ['Operasional', 'Layanan', 'Acara'];

const PILIHAN_STATUS = [
    { nilai: 'Draft', judul: 'Draft', teks: 'Disimpan dulu, belum tampil di halaman publik.' },
    { nilai: 'Published', judul: 'Published', teks: 'Langsung tampil di beranda dan halaman pengumuman.' },
];


const AWAL = { judul: '', isi: '', kategori: '', tanggal_rilis: '', status: 'Draft' };

export default function FormPengumuman({ pengumumanId }) {
    const ubah = pengumumanId !== undefined;
    const router = useRouter();

    const [form, setForm] = useState(AWAL);
    const [status, setStatus] = useState(ubah ? 'memuat' : 'siap'); // 'memuat' | 'siap' | 'tidak-ada' | 'galat'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!ubah) return;
        fetch(`/api/pegawai/pengumuman/${pengumumanId}`)
            .then(async (res) => {
                if (res.status === 404) {
                    setStatus('tidak-ada');
                    return;
                }
                if (!res.ok) throw new Error('gagal');
                const { pengumuman } = await res.json();
                setForm({
                    judul: pengumuman.judul,
                    isi: pengumuman.isi,
                    kategori: pengumuman.kategori,
                    tanggal_rilis: pengumuman.tanggal_rilis,
                    status: pengumuman.status,
                });
                setStatus('siap');
            })
            .catch(() => setStatus('galat'));
    }, [ubah, pengumumanId]);

    function ubahInput(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function kirim(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const url = ubah ? `/api/pegawai/pengumuman/${pengumumanId}` : '/api/pegawai/pengumuman';
        const hasil = await kirimAksi(url, form);
        setLoading(false);

        if (!hasil.ok) {
            setError(hasil.pesan);
            return;
        }
        router.push(`/dashboard/pegawai/pengumuman?pesan=${encodeURIComponent(hasil.pesan)}`);
    }

    const tautanKembali = (
        <Link
            href="/dashboard/pegawai/pengumuman"
            className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
        >
            <ArrowLeft size={16} aria-hidden="true" /> Kembali ke daftar pengumuman
        </Link>
    );

    if (status === 'memuat') {
        return (
            <div className="space-y-6 py-4 md:py-8" aria-busy="true">
                <div className="h-8 w-48 animate-pulse rounded-lg bg-garis/60" />
                <div className="h-96 animate-pulse rounded-2xl bg-garis/60" />
            </div>
        );
    }
    if (status === 'tidak-ada') {
        return (
            <div className="py-16 text-center">
                <p className="font-judul text-2xl">Pengumuman tidak ditemukan</p>
                <div className="mt-3">{tautanKembali}</div>
            </div>
        );
    }
    if (status === 'galat') {
        return (
            <p role="alert" className="py-10 text-koral-tua">
                Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.
            </p>
        );
    }


    return (
        <div className="py-4 md:py-8">
            {tautanKembali}

            <p className="mt-6 text-xs font-medium uppercase tracking-widest text-abu">Kelola pengumuman</p>
            <h1 className="mt-1 font-judul text-3xl md:text-4xl">
                {ubah ? 'Ubah pengumuman' : 'Tulis pengumuman'}
            </h1>

            <form onSubmit={kirim} className={`${kelasPanel} mt-8 max-w-3xl space-y-5 p-5 md:p-7`}>
                <KolomForm label="Judul pengumuman">
                    <input
                        name="judul"
                        value={form.judul}
                        onChange={ubahInput}
                        maxLength={200}
                        required
                        className={kelasInput}
                    />
                </KolomForm>

                <div className="grid gap-5 sm:grid-cols-2">
                    <KolomForm label="Kategori">
                        <select
                            name="kategori"
                            value={form.kategori}
                            onChange={ubahInput}
                            required
                            className={`${kelasInput} cursor-pointer`}
                        >
                            <option value="" disabled>
                                Pilih kategori
                            </option>
                            {KATEGORI.map((k) => (
                                <option key={k} value={k}>
                                    {k}
                                </option>
                            ))}
                        </select>
                    </KolomForm>

                    <KolomForm
                        label="Tanggal rilis"
                        petunjuk={ubah ? undefined : 'Kosongkan untuk memakai tanggal hari ini.'}
                    >
                        <input
                            name="tanggal_rilis"
                            type="date"
                            value={form.tanggal_rilis}
                            onChange={ubahInput}
                            className={kelasInput}
                        />
                    </KolomForm>
                </div>

                <KolomForm label="Isi pengumuman">
                    <textarea
                        name="isi"
                        value={form.isi}
                        onChange={ubahInput}
                        maxLength={5000}
                        rows={9}
                        required
                        className={`${kelasInput} py-3 leading-relaxed`}
                    />
                </KolomForm>

                <fieldset>
                    <legend className="mb-1.5 text-sm font-medium">Status publikasi</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {PILIHAN_STATUS.map((p) => (
                            <label
                                key={p.nilai}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-garis bg-krem p-4 transition-colors has-[:checked]:border-tinta has-[:checked]:bg-kertas has-[:focus-visible]:outline-2"
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={p.nilai}
                                    checked={form.status === p.nilai}
                                    onChange={ubahInput}
                                    className="mt-1 size-4 accent-koral"
                                />
                                <span>
                                    <span className="block text-sm font-medium">{p.judul}</span>
                                    <span className="mt-0.5 block text-xs text-tinta-lembut">{p.teks}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                {error && (
                    <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap justify-end gap-2 border-t border-garis pt-5">
                    <Link href="/dashboard/pegawai/pengumuman" className={kelasTombol.garis}>
                        Batal
                    </Link>

                    <button type="submit" disabled={loading} className={kelasTombol.koral}>
                        {loading ? 'Menyimpan...' : ubah ? 'Simpan perubahan' : 'Simpan pengumuman'}
                    </button>
                </div>
            </form>
        </div>
    );
}