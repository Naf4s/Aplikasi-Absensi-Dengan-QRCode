import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './utils/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000; //Port backend, default 8000

//Middleware
app.use(cors()); // Allow request from frontend
app.use(express.json()); // Allow Express proccesing JSON from request body

// Database initialize before server run
initializeDatabase().then(() => {
    console.log('Database Berhasil Diinisialisasi, server siap.');

    //Route Sederhana untuk Test
    app.get('/', (req, res) => {
        res.send('API Backend Absensi QR Code berjalan!');
    });

    //

    // Run Server after database ready
    app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
    console.log(`Akses di: http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Gagal memulai server karena masalah database:', error);
    process.exit(1); // exit if any database fatal problem 
});

