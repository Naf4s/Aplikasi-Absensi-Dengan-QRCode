// backend/controllers/attendanceController.js
import * as attendanceModel from "../models/attendanceModel.js";
import * as studentModel from "../models/studentModel.js";
import * as classModel from "../models/classModel.js";
import { sendWA } from "../service/waService.js";

// whatsapp notification from alphapage
export const sendWa = async (req, res) => {
  const { phone_number, siswa } = req.body;

  if (!phone_number) {
    return res.status(400).json({ message: "phone_number wajib diisi." });
  }

  const message = `📢 *Pemberitahuan Absensi Siswa*\n\nNama: *${siswa.name}*\nKelas: *${siswa.class}*\n\nKami informasikan bahwa *${siswa.name}* telah tercatat *alpa sebanyak ${siswa.total_absent} kali* pada *${siswa.absent_dates}*.\n\nMohon perhatian dan pendampingan dari Bapak/Ibu agar kehadiran dan disiplin *${siswa.name}* dapat ditingkatkan.\n\nTerima kasih atas kerja samanya.🙏`;

  try {
    await sendWA(phone_number, message);
    res.json({ success: true, message: "Pesan berhasil dikirim." });
  } catch (error) {
    console.error("Gagal mengirim WA:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengirim pesan WA." });
  }
};

// Ini Wajib Kamu Ingat! (Prinsip #5: Validasi Input & Autorisasi di Controller)
// Di sini kita akan cek permission dan validasi semua input dari user.

// Mencatat absensi (dari scan QR atau input manual)
export const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status, timeIn, notes } = req.body;
    const markedByUserId = req.user.id;

    if (!studentId || !date || !status) {
      return res
        .status(400)
        .json({ message: "studentId, date, dan status wajib diisi." });
    }
    if (!["present", "absent", "sick", "permit"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid." });
    }
    const student = await studentModel.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Siswa tidak ditemukan." });
    }

    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki izin untuk mencatat absensi." });
    }

    const record = await attendanceModel.recordAttendance(
      studentId,
      date,
      status,
      timeIn,
      notes,
      markedByUserId
    );
    res
      .status(200)
      .json({ message: "Absensi berhasil dicatat/diperbarui.", record });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server saat mencatat absensi." });
  }
};

// Mengambil daftar absensi
export const getAttendance = async (req, res) => {
  try {
    const filters = req.query; // Ambil filter dari query params (date, class, studentId, status, searchTerm)

    // Jika user adalah guru, batasi kelas hanya ke kelas yang diwaliki guru tersebut
    if (req.user.role === "teacher") {
      // Ambil kelas yang diwalikan guru ini
      const classes = await classModel.getClassesByTeacherId(req.user.id);
      const classNames = classes.map((c) => c.name);

      // Jika guru tidak punya wali kelas, beri respon kosong
      if (classNames.length === 0) {
        return res.status(200).json([]); // Atau beri pesan: Anda belum memiliki kelas yang diawalikan
      }

      // Jika guru menyertakan filter kelas yang bukan dia walikan, tolak
      if (req.query.class && !classNames.includes(req.query.class)) {
        return res
          .status(403)
          .json({
            message: "Anda tidak memiliki izin untuk melihat kelas ini.",
          });
      }

      // Batasi hasil hanya ke kelas yang diawalikan
      filters.class = classNames;
    }

    const records = await attendanceModel.getAttendanceRecords(filters);
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan server saat mengambil data absensi.",
      });
  }
};

// Endpoint untuk scanner QR code
export const scanQrCode = async (req, res) => {
  try {
    const { qrData, date, timeIn } = req.body; // qrData berisi { id: studentId, nis, name, class }
    const markedByUserId = req.user.id;

    if (!qrData || !date || !timeIn) {
      return res
        .status(400)
        .json({ message: "Data QR, tanggal, dan waktu wajib diisi." });
    }

    let parsedQrData;
    try {
      parsedQrData = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({ message: "Format data QR tidak valid." });
    }

    const studentId = parsedQrData.id;
    if (!studentId) {
      return res
        .status(400)
        .json({ message: "ID siswa tidak ditemukan dalam data QR." });
    }

    const student = await studentModel.getStudentById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Siswa tidak ditemukan." });
    }

    const record = await attendanceModel.recordAttendance(
      studentId,
      date,
      "present",
      timeIn,
      "Absen via QR",
      markedByUserId
    );
    res
      .status(200)
      .json({ message: "Absensi berhasil dicatat via QR.", record, student });
  } catch (error) {
    console.error("Error scanning QR code:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server saat memproses scan QR." });
  }
};

// Mengambil status absensi semua siswa untuk kelas dan tanggal tertentu
export const getStudentStatusesByClassAndDate = async (req, res) => {
  try {
    const { className, date } = req.query;
    if (!className || !date) {
      return res
        .status(400)
        .json({ message: "Nama kelas dan tanggal wajib diisi." });
    }

    const studentsInClass = await attendanceModel.getStudentsByClass(className);
    const results = [];

    for (const student of studentsInClass) {
      const attendance =
        await attendanceModel.getStudentAttendanceStatusForDate(
          student.id,
          date
        );
      results.push({
        id: student.id,
        nis: student.nis,
        name: student.name,
        class: student.class,
        gender: student.gender,
        status: attendance ? attendance.status : "none",
        timeIn: attendance ? attendance.time_in : null,
        notes: attendance ? attendance.notes : null,
      });
    }
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching student statuses:", error);
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan server saat mengambil status siswa.",
      });
  }
};

// Mengambil status absensi semua siswa berdasarkan bulan
export const getStudentStatusesByMonth = async (req, res) => {
  try {
    const { className, monthName } = req.query;
    if (!className || !monthName) {
      return res
        .status(400)
        .json({ message: "Bulan, tanggal atau kelas wajib diisi." });
    }

    const attendance = await attendanceModel.getStudentAttendanceStatusForMonth(
      monthName
    );

    res.status(200).json(attendance);
  } catch (error) {
    console.error("Error fetching student statuses:", error);
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan server saat mengambil status siswa.",
      });
  }
};

export const getAbsentMonth = async (req, res) => {
  try {
    const month = await attendanceModel.getAbsentMonth();
    return res.status(200).json(month);
  } catch (error) {
    console.error("Error fetching absent month:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server saat mengambil data bulan." });
  }
};
