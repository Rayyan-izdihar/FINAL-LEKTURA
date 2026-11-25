import ExcelJS from 'exceljs';

// Membuat file Excel (.xlsx) dengan format otomatis.
export async function kirimXlsx(namaBerkas, kolom, baris) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan');

    // Header tabel
    worksheet.addRow(kolom.map(([nama]) => nama));

    const header = worksheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    header.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF202431' },
    };
    header.alignment = { vertical: 'middle', horizontal: 'center' };
    header.height = 24;

    // Isi tabel
    baris.forEach((b) => {
        const row = worksheet.addRow(
            kolom.map(([, kunci]) => {
                const nilai = b[kunci];

                // ISBN selalu disimpan sebagai teks.
                if (kunci === 'isbn') {
                    return nilai === null || nilai === undefined ? '' : String(nilai);
                }

                return nilai ?? '';
            })
        );

        // Format kolom sesuai jenis datanya.
        kolom.forEach(([, kunci], i) => {
            const cell = row.getCell(i + 1);

            if (kunci === 'isbn') {
                cell.numFmt = '@';
            }

            if (kunci === 'denda') {
                cell.numFmt = '"Rp" #,##0';
            }
        });

        row.alignment = { vertical: 'middle' };
    });

    
    // Lebar kolom otomatis berdasarkan isi terpanjang.
    worksheet.columns.forEach((column, i) => {
        let maxLength = String(kolom[i][0]).length;

        column.eachCell({ includeEmpty: true }, (cell) => {
            const panjang = String(cell.value ?? '').length;
            maxLength = Math.max(maxLength, panjang);
        });

        // Minimal 12 dan maksimal 40 karakter.
        column.width = Math.min(Math.max(maxLength + 3, 12), 40);
    });

    // Header tetap terlihat saat tabel digulir.
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Filter pada header.
    worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: kolom.length },
    };

    const tanggal = new Date().toLocaleDateString('sv-SE');
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${namaBerkas}-${tanggal}.xlsx"`,
            'Cache-Control': 'no-store',
        },
    });
}
