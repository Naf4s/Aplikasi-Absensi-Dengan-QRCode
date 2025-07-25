#!/bin/bash

# Navigasi ke folder fe dan jalankan npm run dev di background
cd fe-absensi-app && npm run dev &

# Simpan PID proses frontend
FE_PID=$!

# Navigasi ke folder backend dan jalankan npm start di background
cd ./backend && npm start &

# Simpan PID proses backend
BE_PID=$!

# Trap untuk menangkap sinyal Ctrl+C dan menghentikan kedua proses
trap "kill $FE_PID $BE_PID" SIGINT

# Tunggu sampai kedua proses selesai
wait