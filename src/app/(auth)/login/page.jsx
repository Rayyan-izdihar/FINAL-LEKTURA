'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import { kelasTombol } from '@/lib/gaya';

export default function HalamanLogin() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    // Setelah register berhasil, halaman ini dibuka dengan ?terdaftar=1
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('terdaftar')) {
            setInfo('Pendaftaran berhasil. Silakan masuk.');
        }
    }, []);

    
    // Satu fungsi untuk semua kolom: name="email" mengubah form.email, dan seterusnya.
    function ubahInput(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function kirim(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.pesan);
                return;
            }

            // proxy.js menyimpan halaman tujuan awal di ?dari=...
            // Hanya alamat dalam situs ini yang diterima (diawali satu "/").
            const dari = new URLSearchParams(window.location.search).get('dari');
            const aman = dari && dari.startsWith('/') && !dari.startsWith('//');
            router.push(aman ? dari : data.tujuan);
            router.refresh();
        } catch {
            setError('Tidak dapat terhubung ke server. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1 className="font-judul text-3xl">Masuk</h1>
            <p className="mt-2 text-sm text-tinta-lembut">
                Masuk untuk mengajukan peminjaman dan memantau tanggunganmu.
            </p>

            {info && (
                <p role="status" className="mt-5 rounded-xl border border-garis bg-kertas px-4 py-3 text-sm">
                    {info}
                </p>
            )}
            {error && (
                <p role="alert" className="mt-5 rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {error}
                </p>
            )}

            <form onSubmit={kirim} className="mt-6 space-y-4">
                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@kampus.ac.id"
                    value={form.email}
                    onChange={ubahInput}
                    required
                />

                <InputField
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={ubahInput}
                    required
                />

                <button type="submit" disabled={loading} className={`${kelasTombol.koral} w-full`}>
                    {loading ? 'Memproses...' : 'Masuk'}
                </button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
                <p className="text-tinta-lembut">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-medium text-tinta underline underline-offset-4">
                        Daftar sebagai mahasiswa
                    </Link>
                </p>

                <Link href="/" className={`${kelasTombol.garis} w-full`}>
                    Continue as Guest
                </Link>
            </div>
        </div>
    );
}