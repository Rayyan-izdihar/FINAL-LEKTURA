// Mengubah kata kunci menjadi pola untuk ILIKE, misalnya "bumi" menjadi "%bumi%".
// Karakter % dan _ diberi garis miring agar dibaca apa adanya, bukan sebagai pola pencarian.
export function polaCari(kataKunci) {
    return `%${kataKunci.trim().slice(0, 100).replace(/[\\%_]/g, '\\$&')}%`;
}