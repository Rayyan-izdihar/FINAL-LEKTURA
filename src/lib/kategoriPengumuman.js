import { CalendarDays, ConciergeBell, Clock, Megaphone } from 'lucide-react';

// Warna dan ikon tiap kategori pengumuman, dipakai di kartu, daftar, dan halaman detail.
// Semua kelas ditulis utuh supaya terbaca oleh Tailwind.
//   Acara = koral, Layanan = hijau, Operasional = kuning
const GAYA = {
    Acara: {
        ikon: CalendarDays,
        teks: 'text-koral-tua',
        bar: 'bg-koral',
        titik: 'bg-koral',
        ubin: 'bg-koral/10 text-koral-tua',
        pil: 'bg-koral/10 text-koral-tua',
        latar: 'border-koral/20 bg-koral/10',
        ikonBesar: 'text-koral/15',
        pilGelap: 'bg-koral text-white',
        ikonGelap: 'text-koral/30',
    },
    Layanan: {
        ikon: ConciergeBell,
        teks: 'text-hijau',
        bar: 'bg-hijau',
        titik: 'bg-hijau',
        ubin: 'bg-hijau-muda text-hijau',
        pil: 'bg-hijau-muda text-hijau',
        latar: 'border-hijau/20 bg-hijau-muda',
        ikonBesar: 'text-hijau/15',
        pilGelap: 'bg-hijau-muda text-hijau',
        ikonGelap: 'text-hijau/60',
    },
    Operasional: {
        ikon: Clock,
        teks: 'text-kuning',
        bar: 'bg-kuning',
        titik: 'bg-kuning',
        ubin: 'bg-kuning-muda text-kuning',
        pil: 'bg-kuning-muda text-kuning',
        latar: 'border-kuning/20 bg-kuning-muda',
        ikonBesar: 'text-kuning/15',
        pilGelap: 'bg-kuning-muda text-kuning',
        ikonGelap: 'text-kuning-muda/15',
    },
};

const BAWAAN = {
    ikon: Megaphone,
    teks: 'text-tinta-lembut',
    titik: 'bg-abu',
    bar: 'bg-abu',
    ubin: 'bg-tinta/5 text-tinta-lembut',
    pil: 'bg-tinta/5 text-tinta-lembut',
    latar: 'border-garis bg-kertas',
    ikonBesar: 'text-tinta/10',
    pilGelap: 'bg-krem text-tinta',
    ikonGelap: 'text-krem/10',
};

export function gayaKategori(nama) {
    return GAYA[nama] ?? BAWAAN;
}