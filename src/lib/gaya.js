
const dasarTombol =
    'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const kelasTombol = {
    gelap: `${dasarTombol} bg-tinta text-krem hover:bg-tinta-lembut`,
    koral: `${dasarTombol} bg-koral text-white hover:bg-koral-tua`,
    hijau: `${dasarTombol} bg-hijau text-white hover:bg-hijau/90`,
    garis: `${dasarTombol} border border-tinta/30 text-tinta hover:bg-tinta/5`,
};

// Versi lebih kecil untuk tombol di dalam daftar dan kartu
const dasarTombolKecil =
    'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const kelasTombolKecil = {
    gelap: `${dasarTombolKecil} bg-tinta text-krem hover:bg-tinta-lembut`,
    koral: `${dasarTombolKecil} bg-koral text-white hover:bg-koral-tua`,
    hijau: `${dasarTombolKecil} bg-hijau text-white hover:bg-hijau/90`,
    garis: `${dasarTombolKecil} border border-tinta/30 text-tinta hover:bg-tinta/5`,
};

export const kelasInput =
    'min-h-11 w-full rounded-xl border border-garis bg-kertas px-4 text-sm text-tinta placeholder:text-abu focus:border-tinta';

export const kelasKartu = 'rounded-2xl border border-garis bg-kertas p-5';

// Panel dengan bayangan lembut, dipakai di dashboard pegawai dan admin
export const kelasPanel = 'rounded-2xl border border-garis bg-kertas shadow-kartu';

export const kelasChip = 'min-h-10 cursor-pointer rounded-full border px-4 text-sm transition-colors';