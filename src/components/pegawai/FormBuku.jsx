'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import KolomForm from '@/components/KolomForm';
import Sampul from '@/components/Sampul';
import { kirimAksi } from '@/lib/aksi';
import { kelasInput, kelasPanel, kelasTombol } from '@/lib/gaya';


const AWAL = {
    judul: '',
    isbn: '',
    penulis: '',
    penerbit: '',
    tahun_terbit: '',
    category_id: '',
    stok_total: '',
    maksimal_pinjam: '7',
    denda_per_hari: '1000',
    sampul: '',
};

export default function FormBuku({ bukuId }) {
    const ubah = bukuId !== undefined;
    const router = useRouter();

    const [form, setForm] = useState(AWAL);
    const [kategori, setKategori] = useState([]);
    const [dipinjam, setDipinjam] = useState(0);
    const [status, setStatus] = useState(ubah ? 'memuat' : 'siap'); // 'memuat' | 'siap' | 'tidak-ada' | 'galat'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Berkas sampul yang dipilih pegawai. Pratinjaunya dibuat dari berkas itu langsung (belum diunggah).
    const [berkas, setBerkas] = useState(null);
    const [pratinjauBerkas, setPratinjauBerkas] = useState('');
    const [galatBerkas, setGalatBerkas] = useState('');
    const [kunciInput, setKunciInput] = useState(0); // naik 1 untuk mengosongkan kolom pilih berkas

    // Lepaskan alamat sementara milik pratinjau saat diganti atau saat halaman ditutup
    useEffect(() => {
        return () => {
            if (pratinjauBerkas) URL.revokeObjectURL(pratinjauBerkas);
        };
    }, [pratinjauBerkas]);


    // Daftar kategori untuk pilihan
    useEffect(() => {
        fetch('/api/categories')
            .then((res) => res.json())
            .then((data) => setKategori(data.kategori))
            .catch(() => setStatus('galat'));
    }, []);

    // Saat ubah: ambil data buku lalu isikan ke formulir
    useEffect(() => {
        if (!ubah) return;
        fetch(`/api/books/${bukuId}`)
            .then(async (res) => {
                if (res.status === 404) {
                    setStatus('tidak-ada');
                    return;
                }
                if (!res.ok) throw new Error('gagal');
                const { buku } = await res.json();
                setForm({
                    judul: buku.judul,
                    isbn: buku.isbn,
                    penulis: buku.penulis,
                    penerbit: buku.penerbit,
                    tahun_terbit: String(buku.tahun_terbit),
                    category_id: String(buku.category_id),
                    stok_total: String(buku.stok_total),
                    maksimal_pinjam: String(buku.maksimal_pinjam),
                    denda_per_hari: String(buku.denda_per_hari),
                    sampul: buku.sampul ?? '',
                });
                setDipinjam(buku.stok_total - buku.stok_tersedia);
                setStatus('siap');
            })
            .catch(() => setStatus('galat'));
    }, [ubah, bukuId]);


    // Satu fungsi untuk semua kolom: name="judul" mengubah form.judul, dan seterusnya
    function ubahInput(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function pilihBerkas(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Pemeriksaan awal di browser supaya pegawai langsung tahu. Server tetap memeriksa ulang.
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setGalatBerkas('Gambar harus berformat JPG, PNG, atau WebP.');
            kosongkanBerkas(false);
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setGalatBerkas('Ukuran gambar maksimal 2 MB.');
            kosongkanBerkas(false);
            return;
        }

        setGalatBerkas('');
        setBerkas(file);
        setPratinjauBerkas(URL.createObjectURL(file));
    }

    function kosongkanBerkas(hapusGalat = true) {
        if (hapusGalat) setGalatBerkas('');
        setBerkas(null);
        setPratinjauBerkas('');
        setKunciInput((k) => k + 1);
    }

    async function kirim(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Formulir dengan berkas dikirim sebagai FormData. Alamat sampul lama tidak ikut dikirim:
        // server hanya mengganti sampul kalau ada berkas baru.
        const kiriman = new FormData();
        Object.entries(form).forEach(([nama, nilai]) => {
            if (nama !== 'sampul') kiriman.append(nama, nilai);
        });
        if (berkas) kiriman.append('berkas', berkas);

        const url = ubah ? `/api/pegawai/buku/${bukuId}` : '/api/pegawai/buku';
        const hasil = await kirimAksi(url, kiriman);
        setLoading(false);

        if (!hasil.ok) {
            setError(hasil.pesan);
            return;
        }
        // Pesan berhasil dibawa lewat alamat, lalu ditampilkan oleh halaman daftar
        router.push(`/dashboard/pegawai/buku?pesan=${encodeURIComponent(hasil.pesan)}`);
    }

    const tautanKembali = (
        <Link
            href="/dashboard/pegawai/buku"
            className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
        >
            <ArrowLeft size={16} aria-hidden="true" /> Kembali ke daftar buku
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
                <p className="font-judul text-2xl">Buku tidak ditemukan</p>
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

            <p className="mt-6 text-xs font-medium uppercase tracking-widest text-abu">Kelola buku</p>
            <h1 className="mt-1 font-judul text-3xl md:text-4xl">{ubah ? 'Ubah buku' : 'Tambah buku'}</h1>

            <form onSubmit={kirim} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_18rem]">
                <div className={`${kelasPanel} p-5 md:p-7`}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <KolomForm label="Judul buku">
                                <input
                                    name="judul"
                                    value={form.judul}
                                    onChange={ubahInput}
                                    maxLength={200}
                                    required
                                    className={kelasInput}
                                />
                            </KolomForm>
                        </div>

                        <KolomForm label="ISBN" petunjuk={ubah ? 'ISBN tidak dapat diubah.' : 'Angka dan tanda hubung, harus unik.'}>
                            <input
                                name="isbn"
                                value={form.isbn}
                                onChange={ubahInput}
                                readOnly={ubah}
                                maxLength={20}
                                required
                                className={`${kelasInput} read-only:bg-tinta/5 read-only:text-abu`}
                            />
                        </KolomForm>

                        <KolomForm label="Kategori">
                            <select
                                name="category_id"
                                value={form.category_id}
                                onChange={ubahInput}
                                required
                                className={`${kelasInput} cursor-pointer`}
                            >
                                <option value="" disabled>
                                    Pilih kategori
                                </option>
                                {kategori.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.nama}
                                    </option>
                                ))}
                            </select>
                        </KolomForm>

                        <KolomForm label="Penulis">
                            <input
                                name="penulis"
                                value={form.penulis}
                                onChange={ubahInput}
                                maxLength={150}
                                required
                                className={kelasInput}
                            />
                        </KolomForm>

                        <KolomForm label="Penerbit">
                            <input
                                name="penerbit"
                                value={form.penerbit}
                                onChange={ubahInput}
                                maxLength={150}
                                required
                                className={kelasInput}
                            />
                        </KolomForm>

                        <KolomForm label="Tahun terbit">
                            <input
                                name="tahun_terbit"
                                type="number"
                                inputMode="numeric"
                                min={1000}
                                value={form.tahun_terbit}
                                onChange={ubahInput}
                                required
                                className={kelasInput}
                            />
                        </KolomForm>

                        <KolomForm
                            label="Stok total (eksemplar)"
                            petunjuk={
                                ubah && dipinjam > 0
                                    ? `Sedang dipinjam ${dipinjam} eksemplar, stok tidak boleh di bawah angka itu.`
                                    : undefined
                            }
                        >
                            <input
                                name="stok_total"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                value={form.stok_total}
                                onChange={ubahInput}
                                required
                                className={kelasInput}
                            />
                        </KolomForm>

                        <KolomForm label="Lama pinjam maksimal (hari)">
                            <input
                                name="maksimal_pinjam"
                                type="number"
                                inputMode="numeric"
                                min={1}
                                value={form.maksimal_pinjam}
                                onChange={ubahInput}
                                required
                                className={kelasInput}
                            />
                        </KolomForm>

                        <KolomForm label="Denda per hari (Rp)">
                            <input
                                name="denda_per_hari"
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={100}
                                value={form.denda_per_hari}
                                onChange={ubahInput}
                                required
                                className={kelasInput}
                            />
                        </KolomForm>

                        <div className="sm:col-span-2">
                            <KolomForm
                                label="Sampul"
                                petunjuk={
                                    ubah && form.sampul
                                        ? 'JPG, PNG, atau WebP, maksimal 2 MB. Kosongkan kalau sampul tidak ingin diganti.'
                                        : 'JPG, PNG, atau WebP, maksimal 2 MB.'
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        key={kunciInput}
                                        type="file"
                                        name="berkas"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={pilihBerkas}
                                        className={`${kelasInput} min-w-0 cursor-pointer py-1.5 text-tinta-lembut file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-tinta file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-krem hover:file:bg-tinta-lembut`}
                                    />

                                    {berkas && (
                                        <button
                                            type="button"
                                            onClick={() => kosongkanBerkas()}
                                            aria-label="Batalkan pilihan gambar"
                                            className={`${kelasTombol.garis} shrink-0 px-3`}
                                        >
                                            <X size={16} aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </KolomForm>

                            {galatBerkas && (
                                <p role="alert" className="mt-2 text-sm text-koral-tua">
                                    {galatBerkas}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <p className="text-tinta-lembut font-medium text-xs mb-4">Atau Masukkan URL</p>
                            <KolomForm
                                petunjuk="URL gambar (https://...)."
                            >
                                <input
                                    name="sampul"
                                    value={form.sampul}
                                    onChange={ubahInput}
                                    placeholder="https://..."
                                    className={kelasInput}
                                />
                            </KolomForm>
                        </div>
                    </div>

                    {error && (
                        <p role="alert" className="mt-5 rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-garis pt-5">
                        <Link href="/dashboard/pegawai/buku" className={kelasTombol.garis}>
                            Batal
                        </Link>

                        <button type="submit" disabled={loading} className={kelasTombol.koral}>
                            {loading ? 'Menyimpan...' : ubah ? 'Simpan perubahan' : 'Tambah buku'}
                        </button>
                    </div>
                </div>

                {/* Pratinjau sampul: gambar yang baru dipilih, atau sampul buku saat ini kalau belum memilih */}
                <aside className={`${kelasPanel} p-5 lg:sticky lg:top-24`}>
                    <p className="text-sm font-medium">Pratinjau sampul</p>

                    <div className="mt-4 flex justify-center">
                        <Sampul src={pratinjauBerkas || form.sampul} judul={form.judul || 'Judul buku'} className="w-40" />
                    </div>

                    <p className="mt-4 text-xs text-abu">
                        {berkas
                            ? `Gambar baru: ${berkas.name}. Akan disimpan setelah kamu menekan tombol simpan.`
                            : 'Pilih gambar untuk melihat pratinjaunya di sini.'}
                    </p>
                </aside>
            </form>
        </div>
    );
}