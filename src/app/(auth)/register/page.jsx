'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '@/components/InputField';
import { kelasTombol } from '@/lib/gaya';

export default function HalamanRegister() {
    const router = useRouter();
    const [form, setForm] = useState({
        nama: '',
        nim: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    function ubahInput(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function kirim(e) {
        e.preventDefault();
        setError('');

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.pesan);
                return;
            }

            router.push('/login?terdaftar=1');
        } catch {
            setError('Tidak dapat terhubung ke server. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1 className="font-judul text-3xl">Daftar</h1>
            <p className="mt-2 text-sm text-tinta-lembut">
                Pendaftaran khusus mahasiswa. Gunakan email kampus
            </p>

            {error && (
                <p role="alert" className="mt-5 rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {error}
                </p>
            )}

            <form onSubmit={kirim} className="mt-6 space-y-4">
                <InputField
                    label="Nama lengkap"
                    name="nama"
                    autoComplete="name"
                    value={form.nama}
                    onChange={ubahInput}
                    required
                />

                <InputField
                    label="NIM"
                    name="nim"
                    placeholder="H071251000"
                    value={form.nim}
                    onChange={ubahInput}
                    required
                />

                <InputField
                    label="Email kampus"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nama@kampus.ac.id"
                    value={form.email}
                    onChange={ubahInput}
                    required
                />

                <InputField
                    label="Password (minimal 8 karakter)"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={form.password}
                    onChange={ubahInput}
                    required
                />

                <button type="submit" disabled={loading} className={`${kelasTombol.koral} w-full`}>
                    {loading ? 'Memproses...' : 'Daftar'}
                </button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
                <p className="text-tinta-lembut">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-medium text-tinta underline underline-offset-4">
                        Masuk
                    </Link>
                </p>

                <Link href="/" className={`${kelasTombol.garis} w-full`}>
                    Continue as Guest
                </Link>
            </div>
        </div>
    );
}