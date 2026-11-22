// Mengirim satu aksi (POST) ke route handler dan mengembalikan hasil yang siap ditampilkan.
// Hasilnya selalu berbentuk { ok: true/false, teks: 'pesan untuk pengguna' },
// termasuk saat server tidak bisa dihubungi, jadi pemanggil tidak perlu try/catch sendiri.
export async function kirimAksi(url, body = {}) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return { ok: res.ok, pesan: data.pesan };
    } catch {
        return { ok: false, pesan: 'Tidak dapat menghubungi server. Coba lagi.' };
    }
}