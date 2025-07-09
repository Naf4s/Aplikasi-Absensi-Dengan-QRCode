    // backend/routes/attendanceRoutes.js
    import express from 'express';
    import { markAttendance, getAttendance, scanQrCode, getStudentStatusesByClassAndDate } from '../controllers/attendanceController.js';
    import authMiddleware, { authorizeRoles } from '../middleware/authMiddleware.js'; // Import middleware otentikasi dan otorisasi

    const router = express.Router();

    // Ini Wajib Kamu Ingat! (Menerapkan Otorisasi pada Route)
    // Kita bisa menambahkan middleware authorizeRoles() setelah authMiddleware.
    // Hanya user dengan role yang disebutkan yang bisa mengakses route ini.

    // Route untuk mencatat absensi (bisa dari manual atau hasil scan QR yang diproses)
    // Hanya admin atau teacher yang bisa
    router.post('/', authMiddleware, authorizeRoles('admin', 'teacher'), markAttendance);

    // Route untuk mendapatkan daftar absensi
    // Hanya admin atau teacher yang bisa
    router.get('/', authMiddleware, authorizeRoles('admin', 'teacher'), getAttendance);

    // Route untuk proses scan QR (ini yang akan dipanggil oleh ScannerPage)
    // Hanya admin atau teacher yang bisa
    router.post('/scan', authMiddleware, authorizeRoles('admin', 'teacher'), scanQrCode);

    // Route untuk mendapatkan status absensi siswa per kelas dan tanggal
    router.get('/status-by-class', authMiddleware, authorizeRoles('admin', 'teacher'), getStudentStatusesByClassAndDate);


    export default router;