// Kumpulan kelas Tailwind yang dipakai berulang, supaya tampilan seragam

const dasarTombol =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export const kelasTombol = {
  gelap: `${dasarTombol} bg-tinta text-krem hover:bg-tinta-lembut`,
  koral: `${dasarTombol} bg-koral text-white hover:bg-koral-tua`,
  garis: `${dasarTombol} border border-tinta/30 text-tinta hover:bg-tinta/5`,
};

export const kelasInput =
  'min-h-11 w-full rounded-xl border border-garis bg-kertas px-4 text-sm text-tinta placeholder:text-abu focus:border-tinta';

export const kelasKartu = 'rounded-2xl border border-garis bg-kertas p-5';