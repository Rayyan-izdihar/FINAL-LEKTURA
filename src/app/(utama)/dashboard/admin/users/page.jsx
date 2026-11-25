'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Dialog from '@/components/Dialog';
import KondisiKosong from '@/components/KondisiKosong';
import Paginasi from '@/components/Paginasi';
import PesanAksi from '@/components/PesanAksi';
import StatusPil from '@/components/StatusPil';
import FormUser from '@/components/admin/FormUser';
import { kirimAksi } from '@/lib/aksi';
import { kelasInput, kelasPanel, kelasTombol, kelasTombolKecil } from '@/lib/gaya';

const NAMA_ROLE = { admin: 'Admin', pegawai: 'Pegawai', mahasiswa: 'Mahasiswa' };
const NADA_ROLE = { admin: 'tinta', pegawai: 'kuning', mahasiswa: 'netral' };

// Lebar kolom di layar lebar. Dipakai bersama oleh baris judul dan baris data agar kolomnya lurus.
const KOLOM = 'md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]';

const kelasChip = 'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm transition-colors';
const kelasHapus =
    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-koral/40 px-4 text-xs font-medium text-koral-tua transition-colors hover:bg-koral/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

export default function KelolaPengguna() {
    const [users, setUsers] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [jumlahPerRole, setJumlahPerRole] = useState({ admin: 0, pegawai: 0, mahasiswa: 0 });
    const [saya, setSaya] = useState(null); // id admin yang sedang login
    const [galat, setGalat] = useState('');
    const [role, setRole] = useState('');
    const [cari, setCari] = useState('');
    const [halaman, setHalaman] = useState(1);
    const [versi, setVersi] = useState(0); // naik 1 setiap ada perubahan data, memicu muat ulang
    const [form, setForm] = useState({ terbuka: false, pengguna: null }); // dialog tambah/ubah
    const [dihapus, setDihapus] = useState(null);
    const [loadingHapus, setLoadingHapus] = useState(false);
    const [pesan, setPesan] = useState(null);

    const tutupPesan = useCallback(() => setPesan(null), []);

    // Dashboard admin membuka halaman ini dengan ?role=mahasiswa untuk menyaring langsung
    useEffect(() => {
        const dariAlamat = new URLSearchParams(window.location.search).get('role');
        if (dariAlamat) setRole(dariAlamat);
    }, []);

    useEffect(() => {
        let dibatalkan = false;
        const params = new URLSearchParams({ page: String(halaman), limit: '10' });
        if (role) params.set('role', role);
        if (cari.trim()) params.set('q', cari.trim());

        fetch(`/api/admin/users?${params.toString()}`)
            .then(async (res) => {
                if (!res.ok) throw new Error('gagal');
                const data = await res.json();
                if (dibatalkan) return;
                setUsers(data.users);
                setPagination(data.pagination);
                setJumlahPerRole(data.jumlah_per_role);
                setSaya(data.saya);
                setGalat('');
                // Kalau halaman yang diminta melewati halaman terakhir (mis. setelah menghapus), server mengoreksinya
                if (data.pagination.halaman !== halaman) setHalaman(data.pagination.halaman);
            })
            .catch(() => {
                if (!dibatalkan) setGalat('Data tidak dapat dimuat. Periksa koneksi database lalu muat ulang halaman.');
            });
        return () => {
            dibatalkan = true;
        };
    }, [halaman, role, cari, versi]);

    function tutupForm() {
        setForm({ terbuka: false, pengguna: null });
    }

    // Dipanggil FormUser setelah berhasil menyimpan
    function suksesForm(hasil) {
        tutupForm();
        setPesan(hasil);
        setVersi((v) => v + 1);
    }

    async function hapus() {
        setLoadingHapus(true);
        const hasil = await kirimAksi(`/api/admin/users/${dihapus.id}/hapus`);
        setLoadingHapus(false);
        setDihapus(null);
        setPesan(hasil);
        if (hasil.ok) setVersi((v) => v + 1);
    }

    const totalAkun = jumlahPerRole.admin + jumlahPerRole.pegawai + jumlahPerRole.mahasiswa;
    const daftarFilter = [
        { nilai: '', label: 'Semua', jumlah: totalAkun },
        { nilai: 'admin', label: 'Admin', jumlah: jumlahPerRole.admin },
        { nilai: 'pegawai', label: 'Pegawai', jumlah: jumlahPerRole.pegawai },
        { nilai: 'mahasiswa', label: 'Mahasiswa', jumlah: jumlahPerRole.mahasiswa },
    ];

    return (
        <div className="space-y-6 py-4 md:py-8">
            <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-1.5 text-sm text-tinta-lembut hover:text-tinta"
            >
                <ArrowLeft size={16} aria-hidden="true" /> Kembali ke dashboard
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-abu">Kelola</p>
                    <h1 className="mt-1 font-judul text-3xl md:text-4xl">Pengguna</h1>
                    <p className="mt-1 text-sm text-tinta-lembut">
                        {pagination ? `${pagination.total} akun ditemukan` : 'Memuat akun...'}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setForm({ terbuka: true, pengguna: null })}
                    className={kelasTombol.gelap}
                >
                    <Plus size={16} aria-hidden="true" />
                    Tambah pengguna
                </button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter peran">
                    {daftarFilter.map((f) => (
                        <button
                            key={f.label}
                            type="button"
                            aria-pressed={role === f.nilai}
                            onClick={() => {
                                setRole(f.nilai);
                                setHalaman(1);
                            }}
                            className={`${kelasChip} ${
                                role === f.nilai
                                    ? 'border-tinta bg-tinta text-krem'
                                    : 'border-garis bg-kertas hover:border-tinta/40'
                            }`}
                        >
                            {f.label}
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                    role === f.nilai ? 'bg-krem/20 text-krem' : 'bg-tinta/10 text-tinta'
                                }`}
                            >
                                {f.jumlah}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:max-w-sm">
                    <Search
                        size={16}
                        aria-hidden="true"
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-abu"
                    />
                    <input
                        type="search"
                        value={cari}
                        onChange={(e) => {
                            setCari(e.target.value);
                            setHalaman(1);
                        }}
                        aria-label="Cari nama, email, atau NIM"
                        placeholder="Cari nama, email, atau NIM..."
                        className={`${kelasInput} rounded-full pl-10`}
                    />
                </div>
            </div>

            {galat && (
                <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {galat}
                </p>
            )}

            {users === null && !galat && (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} className="h-16 animate-pulse rounded-2xl bg-garis/60" />
                    ))}
                </div>
            )}

            {users?.length === 0 && (
                <KondisiKosong
                    ikon={Users}
                    judul="Tidak ada akun yang cocok"
                    teks="Coba kata kunci atau filter peran lain."
                />
            )}

            {users?.length > 0 && (
                <div className={`${kelasPanel} overflow-hidden`}>
                    <div
                        className={`hidden gap-4 border-b border-garis bg-krem/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-abu md:grid ${KOLOM}`}
                    >
                        <span>Pengguna</span>
                        <span>NIM / ID</span>
                        <span>Peran</span>
                        <span>Status</span>
                        <span className="w-44 text-right">Aksi</span>
                    </div>

                    <ul className="divide-y divide-garis">
                        {users.map((u) => (
                            <li key={u.id} className={`grid gap-3 px-4 py-4 md:items-center md:gap-4 md:px-5 ${KOLOM}`}>
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar nama={u.nama} ukuran={40} />
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {u.nama}
                                            {u.id === saya && <span className="ml-2 text-xs text-abu">(kamu)</span>}
                                        </p>
                                        <p className="truncate text-sm text-tinta-lembut">{u.email}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-tinta-lembut">
                                    <span className="text-abu md:hidden">NIM: </span>
                                    {u.nim ?? '-'}
                                </p>

                                <div>
                                    <StatusPil nada={NADA_ROLE[u.role]}>{NAMA_ROLE[u.role]}</StatusPil>
                                </div>

                                <div>
                                    <StatusPil nada={u.aktif ? 'hijau' : 'koral'}>
                                        {u.aktif ? 'Aktif' : 'Nonaktif'}
                                    </StatusPil>
                                </div>

                                <div className="flex gap-2 md:w-44 md:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setForm({ terbuka: true, pengguna: u })}
                                        className={kelasTombolKecil.garis}
                                    >
                                        <Pencil size={14} aria-hidden="true" />
                                        Ubah
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDihapus(u)}
                                        disabled={u.id === saya}
                                        title={u.id === saya ? 'Akunmu sendiri tidak dapat dihapus' : undefined}
                                        className={kelasHapus}
                                    >
                                        <Trash2 size={14} aria-hidden="true" />
                                        Hapus
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {pagination && (
                        <div className="px-5 pb-5">
                            <Paginasi
                                halaman={pagination.halaman}
                                totalHalaman={pagination.totalHalaman}
                                total={pagination.total}
                                limit={pagination.limit}
                                onUbah={setHalaman}
                            />
                        </div>
                    )}
                </div>
            )}

            <Dialog
                buka={form.terbuka}
                onTutup={tutupForm}
                judul={form.pengguna ? 'Ubah pengguna' : 'Tambah pengguna'}
            >
                {form.terbuka && (
                    <FormUser
                        key={form.pengguna?.id ?? 'baru'}
                        pengguna={form.pengguna}
                        saya={saya}
                        onSukses={suksesForm}
                        onBatal={tutupForm}
                    />
                )}
            </Dialog>

            <Dialog buka={dihapus !== null} onTutup={() => setDihapus(null)} judul="Hapus akun?">
                {dihapus && (
                    <div className="space-y-4">
                        <p className="text-sm text-tinta-lembut">
                            Akun <span className="font-medium text-tinta">{dihapus.nama}</span> akan dihapus. Akun
                            yang masih punya transaksi aktif atau punya riwayat transaksi tidak dapat dihapus, dan
                            sebagai gantinya bisa dinonaktifkan lewat menu Ubah.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setDihapus(null)} className={kelasTombol.garis}>
                                Batal
                            </button>
                            <button type="button" onClick={hapus} disabled={loadingHapus} className={kelasTombol.koral}>
                                {loadingHapus ? 'Menghapus...' : 'Ya, hapus'}
                            </button>
                        </div>
                    </div>
                )}
            </Dialog>

            <PesanAksi pesan={pesan} onTutup={tutupPesan} />
        </div>
    );
}