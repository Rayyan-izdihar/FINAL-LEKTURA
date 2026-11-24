import { Clock } from 'lucide-react';

// Warna sampul mengikuti buku-buku di rak "terpopuler" supaya terasa satu keluarga.
// [x, lebar, tinggi, warna]
const BUKU = [
    [60, 34, 150, '#c94444'],
    [98, 28, 118, '#1f2430'],
    [130, 40, 172, '#2f6f55'],
    [174, 30, 132, '#c4993a'],
    [250, 36, 162, '#1c2b4a'],
    [290, 30, 126, '#c94444'],
    [324, 28, 146, '#c4993a'],
];
const DASAR = 300; // garis rak

// Ilustrasi hiasan untuk bagian atas beranda (tidak membawa informasi, jadi disembunyikan dari pembaca layar).
export default function IlustrasiRak() {
    return (
        <div className="relative rounded-3xl bg-kuning-muda p-4 sm:p-6">
            <svg viewBox="0 0 480 330" aria-hidden="true" className="h-auto w-full">
                <circle cx="250" cy="175" r="135" fill="#fbf9f1" opacity="0.85" />
                <circle cx="395" cy="70" r="26" fill="#c94444" opacity="0.18" />

                {/* Buku berdiri (nomor 5 miring bersandar) */}
                {BUKU.slice(0, 4).map(([x, w, h, warna]) => (
                    <Buku key={x} x={x} w={w} h={h} warna={warna} />
                ))}
                <g transform="rotate(12 240 300)">
                    <Buku x={208} w={32} h={150} warna="#5b3a5e" />
                </g>
                {BUKU.slice(4).map(([x, w, h, warna]) => (
                    <Buku key={x} x={x} w={w} h={h} warna={warna} />
                ))}

                {/* Pita penanda halaman di buku hijau */}
                <path d="M144 128h14v32l-7-6-7 6z" fill="#c94444" />

                {/* Tumpukan buku datar */}
                <rect x="370" y="274" width="84" height="26" rx="2" fill="#5b3a5e" />
                <rect x="376" y="250" width="72" height="24" rx="2" fill="#c94444" />
                <rect x="372" y="228" width="78" height="22" rx="2" fill="#1c2b4a" />
                <rect x="378" y="283" width="60" height="3" fill="#fff" opacity="0.3" />
                <rect x="384" y="259" width="48" height="3" fill="#fff" opacity="0.3" />
                <rect x="380" y="236" width="52" height="3" fill="#fff" opacity="0.3" />

                {/* Papan rak */}
                <rect x="30" y="300" width="430" height="12" rx="6" fill="#1f2430" />
            </svg>

            <p className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-kertas px-4 py-2 text-xs shadow-kartu sm:bottom-6 sm:left-6">
                <Clock size={14} aria-hidden="true" className="text-hijau" />
                Buka Senin sampai Sabtu, 09.00-20.00 WITA
            </p>
        </div>
    );
}

// Satu buku di rak: badan berwarna dengan dua garis di punggungnya
function Buku({ x, w, h, warna }) {
    const atas = DASAR - h;
    return (
        <g>
            <rect x={x} y={atas} width={w} height={h} rx="2" fill={warna} />
            <rect x={x + 6} y={atas + 16} width={w - 12} height="3" fill="#fff" opacity="0.3" />
            <rect x={x + 6} y={atas + 24} width={w - 12} height="3" fill="#fff" opacity="0.3" />
            <rect x={x + 6} y={DASAR - 24} width={w - 12} height="8" rx="1" fill="#fff" opacity="0.18" />
        </g>
    );
}