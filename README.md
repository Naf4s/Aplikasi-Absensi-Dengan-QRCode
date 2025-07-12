# 📚 Aplikasi Absensi Dengan QR Code

Selamat datang di **Aplikasi Absensi Dengan QR Code**! 🎉  
Sistem absensi berbasis web yang memanfaatkan teknologi QR Code untuk memudahkan proses absensi siswa atau pengguna secara cepat dan akurat.

---

## 🚀 Struktur Proyek

- `backend/` - Backend API menggunakan **Node.js**, **Express**, dan **SQLite** sebagai database.
- `fe-absensi-app/` - Frontend aplikasi web menggunakan **React**, **TypeScript**, dan **Vite** sebagai build tool.

---

## 🛠️ Backend

### 🔧 Teknologi

- Node.js (ES Modules)
- Express
- SQLite (database file: `backend/absensi.db`)
- bcryptjs, jsonwebtoken untuk autentikasi dan keamanan
- dotenv untuk konfigurasi environment
- CORS untuk komunikasi dengan frontend

### ⚙️ Instalasi dan Menjalankan Backend

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Buat file `.env` di dalam folder `backend` jika diperlukan, contoh isi minimal:
   ```
   PORT=8000
   ```

4. Jalankan server:
   ```bash
   node server.js
   ```
   Server akan berjalan di `http://localhost:8000` (atau port sesuai konfigurasi `.env`).

### 🔗 API Endpoint

Backend menyediakan berbagai endpoint API di bawah prefix `/api`, seperti:  
- 🔐 `/api/auth` - Autentikasi pengguna  
- 👩‍🎓 `/api/students` - Manajemen data siswa (dilindungi autentikasi)  
- 📝 `/api/attendance` - Data absensi (dilindungi autentikasi)  
- 👥 `/api/users` - Manajemen pengguna (dilindungi autentikasi)  
- 🏫 `/api/classes` - Manajemen kelas (dilindungi autentikasi)  
- 📊 `/api/dashboard` - Data dashboard (dilindungi autentikasi)  
- ⚙️ `/api/settings` - Pengaturan aplikasi (dilindungi autentikasi)  

---

## 🎨 Frontend

### 🔧 Teknologi

- React 19 dengan TypeScript
- Vite sebagai build tool dan dev server
- Tailwind CSS untuk styling
- React Router untuk navigasi halaman
- Axios untuk komunikasi HTTP ke backend
- Library tambahan: chart.js, html5-qrcode, qrcode.react, jspdf, dll.

### ⚙️ Instalasi dan Menjalankan Frontend

1. Masuk ke direktori frontend:
   ```bash
   cd fe-absensi-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Jalankan development server:
   ```bash
   npm run dev
   ```
   Aplikasi frontend akan berjalan dan dapat diakses di alamat yang ditampilkan (biasanya `http://localhost:5173`).

---

## 💾 Database

- Database menggunakan SQLite dengan file database berada di `backend/absensi.db`.
- Database diinisialisasi otomatis saat backend dijalankan.

---

## 📝 Cara Penggunaan

1. Jalankan backend terlebih dahulu.  
2. Jalankan frontend.  
3. Akses aplikasi melalui browser pada alamat frontend.  
4. Gunakan fitur absensi dengan QR Code sesuai kebutuhan.

---

## 📄 Lisensi

Proyek ini menggunakan lisensi ISC.
Silakan digunakan dan dikembangkan untuk pembelajaran, penelitian, atau produksi. 🚀

---

## 🤝 Kontribusi
Kami terbuka untuk kolaborasi!
Silakan buat Pull Request atau Issue jika menemukan bug, fitur baru, atau ingin ikut mengembangkan proyek ini.

---

## 🙏 Terima Kasih
Terima kasih telah menggunakan **Aplikasi Absensi dengan QR Code.**
Aplikasi ini dikembangkan dengan semangat kolaborasi dan kemajuan teknologi pendidikan.
Semoga dapat menjadi solusi praktis dalam menciptakan sistem absensi yang rapi, transparan, dan mudah digunakan.❤️

Semoga bermanfaat dalam mendigitalisasi proses kehadiran di sekolah, kantor, atau instansi Anda! 🚀

---