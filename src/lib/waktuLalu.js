// Mengubah selisih detik menjadi teks singkat, misalnya 90 -> "1 menit lalu", 200000 -> "2 hari lalu".
export function formatWaktuLalu(detik) {
    if (detik < 60) return 'Baru saja';

    const menit = Math.floor(detik / 60);
    if (menit < 60) return `${menit} menit lalu`;

    const jam = Math.floor(menit / 60);
    if (jam < 24) return `${jam} jam lalu`;

    const hari = Math.floor(jam / 24);
    if (hari < 30) return `${hari} hari lalu`;

    const bulan = Math.floor(hari / 30);
    if (bulan < 12) return `${bulan} bulan lalu`;

    return `${Math.floor(hari / 365)} tahun lalu`;
}