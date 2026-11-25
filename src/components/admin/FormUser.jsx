'use client';
import { useState } from 'react';
import KolomForm from '@/components/KolomForm';
import { kirimAksi } from '@/lib/aksi';
import { kelasInput, kelasTombol } from '@/lib/gaya';

const PILIHAN_STATUS = [
    { nilai: true, judul: 'Aktif', teks: 'Bisa login dan memakai sistem.' },
    { nilai: false, judul: 'Nonaktif', teks: 'Tidak bisa login dan melakukan aksi.' },
];

// Isi dialog tambah dan ubah pengguna. Tanpa `pengguna` = tambah, dengan `pengguna` = ubah.
// saya = id admin yang sedang login (peran dan status akun sendiri tidak boleh diubah).
// onSukses(hasil) dipanggil halaman induk setelah berhasil, onBatal menutup dialog.
export default function FormUser({ pengguna, saya, onSukses, onBatal }) {
    const ubah = Boolean(pengguna);
    const akunSendiri = ubah && pengguna.id === saya;

    const [form, setForm] = useState({
        nama: pengguna?.nama ?? '',
        email: pengguna?.email ?? '',
        nim: pengguna?.nim ?? '',
        password: '',
        role: pengguna?.role ?? 'mahasiswa',
        aktif: pengguna?.aktif ?? true,
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

        // Saat ubah hanya empat data ini yang dikirim. NIM dan password tidak diubah dari sini.
        const hasil = ubah
            ? await kirimAksi(`/api/admin/users/${pengguna.id}`, {
                  nama: form.nama,
                  email: form.email,
                  role: form.role,
                  aktif: form.aktif,
              })
            : await kirimAksi('/api/admin/users', {
                  nama: form.nama,
                  email: form.email,
                  nim: form.nim,
                  password: form.password,
                  role: form.role,
              });
        setLoading(false);

        if (!hasil.ok) {
            setError(hasil.pesan);
            return;
        }
        onSukses(hasil);
    }

    return (
        <form onSubmit={kirim} className="space-y-4">
            <KolomForm label="Nama lengkap">
                <input
                    name="nama"
                    value={form.nama}
                    onChange={ubahInput}
                    maxLength={100}
                    required
                    className={kelasInput}
                />
            </KolomForm>

            <KolomForm label="Email">
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={ubahInput}
                    maxLength={150}
                    required
                    className={kelasInput}
                />
            </KolomForm>

            <div className={`grid gap-4 ${form.role === 'mahasiswa' ? '' : "sm:grid-cols-2"}`}>
                <KolomForm
                    label="NIM / nomor identitas"
                    petunjuk={ubah ? 'Tidak dapat diubah.' : 'Harus unik.'}
                >
                    <input
                        name="nim"
                        value={form.nim}
                        onChange={ubahInput}
                        readOnly={ubah}
                        maxLength={30}
                        required={!ubah}
                        className={`${kelasInput} read-only:bg-tinta/5 read-only:text-abu`}
                    />
                </KolomForm>

                {form.role !== 'mahasiswa' && 
                    <KolomForm label="Peran">
                        <select
                            name="role"
                            value={form.role}
                            onChange={ubahInput}
                            disabled={akunSendiri}
                            className={`${kelasInput} cursor-pointer disabled:bg-tinta/5 disabled:text-abu`}
                        >
                            <option value="pegawai">Pegawai</option>
                            <option value="admin">Admin</option>
                        </select>
                    </KolomForm>
                }
            </div>

            {!ubah && (
                <KolomForm label="Password" petunjuk="Minimal 8 karakter.">
                    <input
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={form.password}
                        onChange={ubahInput}
                        minLength={8}
                        required
                        className={kelasInput}
                    />
                </KolomForm>
            )}

            {ubah && (
                <fieldset disabled={akunSendiri}>
                    <legend className="mb-1.5 text-sm font-medium">Status akun</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {PILIHAN_STATUS.map((p) => (
                            <label
                                key={p.judul}
                                className="flex cursor-pointer items-start gap-3 rounded-xl border border-garis bg-krem p-3 transition-colors has-[:checked]:border-tinta has-[:checked]:bg-kertas has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
                            >
                                <input
                                    type="radio"
                                    name="aktif"
                                    checked={form.aktif === p.nilai}
                                    onChange={() => setForm({ ...form, aktif: p.nilai })}
                                    className="mt-1 size-4 accent-koral"
                                />
                                <span>
                                    <span className="block text-sm font-medium">{p.judul}</span>
                                    <span className="mt-0.5 block text-xs text-tinta-lembut">{p.teks}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                    {akunSendiri && (
                        <p className="mt-2 text-xs text-abu">Peran dan status akunmu sendiri tidak dapat diubah.</p>
                    )}
                </fieldset>
            )}

            {error && (
                <p role="alert" className="rounded-xl bg-koral/10 px-4 py-3 text-sm text-koral-tua">
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onBatal} className={kelasTombol.garis}>
                    Batal
                </button>
                <button type="submit" disabled={loading} className={kelasTombol.koral}>
                    {loading ? 'Menyimpan...' : ubah ? 'Simpan perubahan' : 'Tambah pengguna'}
                </button>
            </div>
        </form>
    );
}