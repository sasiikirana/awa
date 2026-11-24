const cors = require('cors');
const express = require('express');
const pool = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;
// Mengambil seluruh alat
app.get('/api/alat', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM alat ORDER BY Id_alat`
        );
        res.status(200).json({
            data: result.rows
        });

    } catch (error) {
        console.error('Gagal mengambil seluruh produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});

// Mengambil satu alat berdasarkan ID
app.get('/api/alat/:id_alat', async (req, res) => {
    const id_alat = Number(req.params.id_alat);
if (!Number.isSafeInteger(id_alat) || id_alat <= 0) {
    return res.status(400).json({
    message: 'ID alat harus berupa bilangan bulat positif'
});
}

try {
    const result = await pool.query(
    'SELECT * FROM alat WHERE id_alat = $1',
    [id_alat]
);
if (result.rows.length === 0) {
    return res.status(404).json({
    message: 'alat tidak ditemukan'
});
}
    res.status(200).json(result.rows[0]);
} catch (error) {
console.error('Gagal mengambil alat:', error.message);
    res.status(500).json({
    message: 'Terjadi kesalahan saat mengambil data alat'
});
}
});

app.post('/api/alat', async (req, res) => {
    const { nama_alat, kondisi, stok, lokasi, id_kategori } = req.body;

    // Validasi data sebelum dimasukkan ke database
    if (
    typeof nama_alat !== 'string' ||
    !nama_alat.trim() ||
    typeof kondisi !== 'string' ||
    !kondisi.trim() ||
    !Number.isInteger(stok) ||
    stok < 0 ||
    typeof lokasi !== 'string' ||
    !lokasi.trim() ||
    !Number.isInteger(id_kategori) ||
    id_kategori <= 0
  ) {
    return res.status(400).json({
      message: 'Data alat tidak valid'
    });
  }

    try {
        const result = await pool.query(
    `INSERT INTO alat
    ( nama_alat, kondisi, stok, lokasi, id_kategori)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
        nama_alat.trim(),
        kondisi.trim(),
        stok,
        lokasi.trim(),
        id_kategori
    ]
);

        res.status(201).json({
            message: 'alat berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal menambahkan alat:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menambahkan alat'
        });
    }
});

app.put('/api/alat/:id_alat', async (req, res) => {
    const id_alat = Number(req.params.id_alat);
    const { nama_alat, kondisi, stok, lokasi, id_kategori } = req.body;

    // 1. Validasi ID alat
    if (!Number.isSafeInteger(id_alat) || id_alat <= 0) {
        return res.status(400).json({
            message: 'ID alat tidak valid'
        });
    }

    // 2. Validasi data alat (sama seperti route POST)
    if (
    typeof nama_alat !== 'string' ||
    !nama_alat.trim() ||
    typeof kondisi !== 'string' ||
    !kondisi.trim() ||
    !Number.isInteger(stok) ||
    stok < 0 ||
    typeof lokasi !== 'string' ||
    !lokasi.trim() ||
    !Number.isInteger(id_kategori) ||
    id_kategori <= 0
  ) {
        return res.status(400).json({
            message: 'Data produk tidak valid'
        });
    }

    // 3. Jika semua valid, baru jalankan query
    try {
        const result = await pool.query(
            `UPDATE alat
             SET nama_alat = $1,
                kondisi = $2,
                 stok = $3,
                 lokasi = $4,
                 id_kategori = $5
             WHERE id_alat = $6
             RETURNING *`,
            [
                nama_alat.trim(),
                kondisi.trim(),
                stok,
                lokasi.trim(),
                id_kategori,
                id_alat
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'alat tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'alat berhasil diperbarui',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Gagal memperbarui alat:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui alat'
        });
    }
});

app.delete('/api/alat/:id_alat', async (req, res) => {
    const id_alat= Number(req.params.id_alat);

    // Memeriksa ID sebelum query dijalankan
    if (!Number.isInteger(id_alat) || id_alat <= 0) {
        return res.status(400).json({
            message: 'ID alat tidak valid'
        });
    }
       try {
        const result = await pool.query(
            'DELETE FROM alat WHERE id_alat = $1 RETURNING *',
            [id_alat]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'alat tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'alat berhasil dihapus'
        });
    } catch (error) {
        console.error('Gagal menghapus alat:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menghapus alat'
       });
      }
   });

   app.get('/api/kategori_alat', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM kategori_alat ORDER BY id_kategori'
        );

        res.status(200).json(result.rows);
    } catch (error) {
    console.error(error);

    res.status(500).json({
        message: 'Terjadi kesalahan saat mengambil data kategori'
    });
}
});

// GET KATEGORI BY ID
app.get('/api/kategori_alat/:id_kategori', async (req, res) => {
    try {
        const id_kategori = Number(req.params.id_kategori);

        if (!Number.isInteger(id_kategori) || id_kategori <= 0) {
            return res.status(400).json({
                message: 'ID kategori tidak valid'
            });
        }

        const result = await pool.query(
            'SELECT * FROM kategori_alat WHERE id_kategori = $1',
            [id_kategori]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Kategori tidak ditemukan'
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data kategori'
        });
    }
});

// Mengambil seluruh peminjaman
app.get('/api/peminjaman', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                peminjaman.id_peminjaman,
                peminjaman.id_alat,
                peminjaman.nama_peminjam,
                peminjaman.kelas,
                peminjaman.tanggal_pinjam,
                peminjaman.tanggal_kembali,
                peminjaman.jumlah,
                peminjaman.status,
                alat.nama_alat
            FROM peminjaman
            INNER JOIN alat 
            ON peminjaman.id_alat = alat.id_alat
            ORDER BY peminjaman.id_peminjaman`
        );

        res.status(200).json({
            data: result.rows
        });

    } catch (error) {
        console.error('Gagal memuat seluruh peminjaman:', error.message);

        res.status(500).json({
            message: 'Terjadi kesalahan saat memuat data peminjaman'
        });
    }
});

// Mengambil peminjaman berdasarkan ID
app.get('/api/peminjaman/:id_peminjaman', async (req, res) => {
    const id_peminjaman = Number(req.params.id_peminjaman);
if (!Number.isSafeInteger(id_peminjaman) || id_peminjaman <= 0) {
    return res.status(400).json({
    message: 'ID peminjaman harus berupa bilangan bulat positif'
});
}

try {
    const result = await pool.query(
    'SELECT * FROM peminjaman WHERE id_peminjaman = $1',
    [id_peminjaman]
);
if (result.rows.length === 0) {
    return res.status(404).json({
    message: 'peminjaman tidak ditemukan'
});
}
    res.status(200).json(result.rows[0]);
} catch (error) {
console.error('Gagal memuat peminjaman:', error.message);
    res.status(500).json({
    message: 'Terjadi kesalahan saat memuat data peminjaman'
});
}
});

app.post('/api/peminjaman', async (req, res) => {
    const { nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status, id_alat } = req.body;
    
    try {
        const result = await pool.query(
    `INSERT INTO peminjaman
    ( nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status, id_alat )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
        nama_peminjam.trim(),
        kelas.trim(),
        tanggal_pinjam,
        tanggal_kembali,
        jumlah,
        status.trim(),
        id_alat
    ]
);

        res.status(201).json({
            message: 'data peminjaman berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal menambahkan data peminjaman:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menambahkan data peminjaman'
        });
    }
});

app.put('/api/peminjaman/:id_peminjaman', async (req, res) => {
    const id_peminjaman = Number(req.params.id_peminjaman);
    const { nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status, id_alat } = req.body;

    try {
        const result = await pool.query(
            `UPDATE peminjaman
             SET nama_peminjam = $1,
                kelas = $2,
                 tanggal_pinjam = $3,
                 tanggal_kembali = $4,
                 jumlah = $5,
                 status = $6,
                 id_alat = $7
                 WHERE id_peminjaman = $8
             RETURNING *`,
            [
                nama_peminjam.trim(),
                kelas.trim(),
                tanggal_pinjam,
                tanggal_kembali,
                jumlah,
                status.trim(),
                id_alat,
                id_peminjaman
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'data peminjaman tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'data peminjaman berhasil diperbarui',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Gagal memperbarui data peminjaman:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui data peminjaman'
        });
    }
});

app.delete('/api/peminjaman/:id_peminjaman', async (req, res) => {
    const id_peminjaman= Number(req.params.id_peminjaman);

    // Memeriksa ID sebelum query dijalankan
    if (!Number.isInteger(id_peminjaman) || id_peminjaman <= 0) {
        return res.status(400).json({
            message: 'ID peminjaman tidak valid'
        });
    }
       try {
        const result = await pool.query(
            'DELETE FROM peminjaman WHERE id_peminjaman = $1 RETURNING *',
            [id_peminjaman]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'peminjaman tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'peminjaman berhasil dihapus'
        });
    } catch (error) {
        console.error('Gagal menghapus peminjaman:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menghapus peminjaman'
       });
      }
   });

app.listen(PORT, () => {
console.log(`Server berjalan di port ${PORT}`);
});