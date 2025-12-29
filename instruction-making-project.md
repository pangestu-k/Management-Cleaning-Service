📌 Scope Sistem Booking Jasa Cleaning Service
🎯 Tujuan Aplikasi

Aplikasi ini digunakan untuk:

Customer melakukan booking jasa cleaning service

Admin mengelola layanan, jadwal, dan order

Cleaner menerima jadwal pekerjaan

👥 Role Pengguna

Minimal 3 role:
1️⃣ Admin

Mengelola data layanan

Mengelola cleaner

Mengelola order & status

Melihat laporan sederhana

2️⃣ Customer

Registrasi & login

Booking jasa

Melihat status booking

Riwayat pesanan

3️⃣ Cleaner

Melihat jadwal pekerjaan yang assigned

Update status (“On Progress”, “Done”)

Jika ingin lebih simple, Cleaner bisa digabung admin. Tapi kalau untuk nilai UAS, sebaiknya tetap ada.

🏗️ Arsitektur Singkat
Backend

Laravel 11 (REST API)

Sanctum / Passport untuk auth

Repository / Service pattern (kalau ingin lebih rapi)

Validation Form Request

Frontend

-   React + TypeScript (karna menggunakan versi baru maka perhatikan bagian import type nya)
    contoh import type di typscript terbaru

-   import type { ExampleType } from "example-file";

-   Ant Design untuk UI

-   Tailwind untuk styling tambahan

-   React Query untuk fetch data

-   React Router untuk routing

-   axios

-   Protected Route per role

    👥 Role Pengguna

1️⃣ Admin

Kelola jenis layanan

Kelola jadwal

Kelola booking

Kelola cleaner

Monitoring dashboard

2️⃣ Customer

Registrasi / Login

Memilih layanan

Memilih jadwal yang tersedia

Melakukan booking

Melihat status booking

3️⃣ Cleaner

Melihat jadwal yang ditugaskan

Update status pekerjaan

🔥 MODUL WAJIB
✅ 1. Modul Jenis Layanan

Digunakan Admin untuk mengelola berbagai jenis layanan cleaning.

Fitur

Admin dapat:

Tambah layanan

Edit layanan

Nonaktifkan / aktifkan layanan

Mengatur:

Nama layanan

Deskripsi

Harga

Estimasi durasi kerja

Kategori (opsional)

Customer dapat:

Melihat daftar layanan yang tersedia

Output pembelajaran (nilai plus UAS):

CRUD

Validasi

Status aktif / nonaktif

✅ 2. Modul Jadwal

Modul ini sangat penting karena menjadi dasar booking.

Konsep Jadwal

Admin menentukan:

Slot waktu kerja setiap hari

Kapasitas slot (berapa booking max dalam satu slot)

Jadwal tersedia / tidak tersedia

Fitur

Admin:

Membuat slot jadwal (contoh 08:00–10:00, 10:00–12:00, dst)

Mengaktifkan / menonaktifkan jadwal

Melihat jadwal yang sudah terbook

Customer:

Hanya bisa memilih jadwal yang:

Status Available

Kapasitas belum penuh

Cleaner:

Melihat jadwal yang sudah assigned ke dia

Nilai akademik:

Business logic schedule & availability

Relasi data terencana

Prevent double booking

✅ 3. Modul Booking Jasa

Inti sistem — customer melakukan pemesanan.

Flow Booking

Customer:
1️⃣ Pilih layanan
2️⃣ Pilih tanggal
3️⃣ Pilih slot jadwal yang masih tersedia
4️⃣ Isi alamat
5️⃣ Konfirmasi booking

Sistem:

Generate kode booking

Mengurangi kapasitas jadwal

Assign cleaner (otomatis/manual sesuai kemampuan kamu)

Status Booking
Pending → Approved → On Progress → Completed / Canceled

Admin:

Approve / Cancel

Assign cleaner

Cleaner:

Set On Progress

Set Completed

Customer:

Melihat progres

Nilai akademik:

State management booking

Role-based control

Transaction logic sederhana

🗂️ Struktur Database (Disesuaikan)
service_types / services

Jenis layanan cleaning

id
name
description
price
duration
status

schedules

Slot jadwal cleaning

id
date
start_time
end_time
capacity
remaining_capacity
status

orders

Booking data

id
order_code
user_id
service_id
schedule_id
cleaner_id (nullable)
address
status
total_price

users

(role: admin / customer / cleaner)

📡 API Utama
Jenis Layanan

GET /services

POST /services (admin)

PUT /services/{id}

DELETE /services/{id}

Jadwal

GET /schedules

POST /schedules (admin)

PUT /schedules/{id}

PUT /schedules/{id}/status

Booking

POST /orders (customer)

GET /orders/my (customer)

GET /orders (admin)

PUT /orders/{id}/status

PUT /orders/{id}/assign-cleaner

📊 Dashboard Sederhana

Total layanan

Total jadwal aktif

Total booking

Statistik status booking

🏗️ Stack Tetap

Backend: Laravel 11 (REST API + Sanctum)

Frontend: React + TypeScript + Ant Design + Tailwind

React Query untuk data fetching

Role-based protected routes

bagian fe (fe ini tidak beda project jadi menyatu di project laravel ini)
🧭 Arsitektur Halaman (Per Role)
👤 Customer Pages

Customer adalah user utama booking → jadi dibuat smooth & simple.

1️⃣ Dashboard Customer

Tujuan

Ringkasan booking + CTA booking

Isi

Welcome

Riwayat terakhir

Tombol “Book Now”

2️⃣ Halaman List Layanan

/customer/services

Isi

Card AntD per layanan:

Nama layanan

Durasi

Harga

Button “Book”

3️⃣ Halaman Pilih Jadwal

/customer/schedules

Flow:
Customer pilih:
1️⃣ Tanggal
2️⃣ Slot waktu yang available

UI:

DatePicker AntD

List / Table slot:

Jam mulai – Jam selesai

Status Available / Full

Button Pilih

4️⃣ Halaman Form Booking

/customer/booking

Form isi:

Service terpilih (readonly)

Jadwal terpilih (readonly)

Alamat

Catatan (opsional)

Button Submit

5️⃣ Halaman Riwayat Booking

/customer/orders

Isi:

Tabel booking

kode booking

layanan

jadwal

status (tag warna AntD)

Detail Order (Modal / Page)

Tracking Status Progress

👨‍💼 Admin Pages

Admin fokus ke pengelolaan data & monitoring.

1️⃣ Dashboard Admin

/admin/dashboard

Isi:

Total Booking

Booking per status

Total Layanan

Jadwal aktif

Small chart (opsional)

2️⃣ Modul Jenis Layanan

/admin/services

List

Table AntD:

Nama

Harga

Durasi

Status

Action (Edit / Delete)

Create / Edit

Modal Form

Validasi

3️⃣ Modul Jadwal

/admin/schedules

Isi:

Filter by date

Table:

Date

Start time

End time

Capacity

Remaining

Status

Action: Edit / Disable

Create Schedule Page / Modal

DatePicker

TimePicker Range

Capacity input

4️⃣ Modul Booking

/admin/orders

Table:

Order Code

Customer

Service

Jadwal

Status

Cleaner

Action

Admin bisa:
✔️ Approve
✔️ Cancel
✔️ Assign Cleaner (Modal pilih cleaner)

5️⃣ Modul Cleaner Management (Opsional tapi bagus)

/admin/cleaners

CRUD cleaner

Assign role cleaner

🧹 Cleaner Pages

Cleaner hanya butuh yang simple.

1️⃣ Dashboard Cleaner

/cleaner/dashboard

Isi:

Jadwal hari ini

Jumlah tugas

2️⃣ Daftar Tugas

/cleaner/tasks

Table:

Booking Code

Customer

Alamat

Jadwal

Status

Cleaner dapat:
✔️ Set On Progress
✔️ Set Completed

buat dashboard, dengan ui menarik, ux mudah digunakan, dan design minimalis namun elegan
