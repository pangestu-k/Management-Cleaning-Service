# Panduan Menjalankan Project Management Cleaning Service

## Persyaratan Sistem

-   **PHP**: >= 8.2
-   **Composer**: Latest version
-   **Node.js**: >= 20.19 atau >= 22.12 (untuk Vite)
-   **Database**: SQLite (default) atau MySQL/PostgreSQL
-   **Laragon** (sudah terinstall di sistem Anda)

## Langkah-langkah Setup

### 1. Setup Environment File

Jika file `.env` belum ada, copy dari `.env.example`:

```bash
# Di Windows PowerShell
Copy-Item .env.example .env
```

Atau buat file `.env` baru dengan konfigurasi berikut:

```env
APP_NAME="Management Cleaning Service"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=cleaning_service
# DB_USERNAME=root
# DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"

# Admin Registration Secret Key
# Ganti dengan secret key yang kuat untuk keamanan
ADMIN_SECRET_KEY=admin-secret-key-change-in-production
```

### 2. Generate Application Key

```bash
php artisan key:generate
```

### 3. Setup Database

**Untuk SQLite (Default):**

-   Pastikan file `database/database.sqlite` sudah ada
-   Jika belum, buat file kosong:
    ```bash
    New-Item -Path database/database.sqlite -ItemType File
    ```

**Untuk MySQL (Opsional):**

-   Buat database baru di Laragon
-   Update konfigurasi di `.env`:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=cleaning_service
    DB_USERNAME=root
    DB_PASSWORD=
    ```

### 4. Jalankan Migrations

```bash
php artisan migrate
```

### 5. Install Dependencies PHP

```bash
composer install
```

### 6. Install Dependencies Node.js

```bash
npm install
```

### 7. Build Assets (Development)

```bash
npm run dev
```

Atau untuk production:

```bash
npm run build
```

## Menjalankan Aplikasi

### Opsi 1: Menjalankan Secara Terpisah (Recommended untuk Development)

**Terminal 1 - Backend (Laravel):**

```bash
php artisan serve
```

Server akan berjalan di: `http://localhost:8000`

**Terminal 2 - Frontend (Vite):**

```bash
npm run dev
```

Vite akan berjalan di: `http://localhost:5173` (atau port lain yang tersedia)

**Akses Aplikasi:**

-   Buka browser dan akses: `http://localhost:8000`
-   Vite akan otomatis hot-reload saat ada perubahan di file frontend

### Opsi 2: Menggunakan Laragon

Jika menggunakan Laragon, Anda bisa:

1. **Start Laragon** dan pastikan Apache/Nginx dan MySQL sudah running
2. **Jalankan Vite** di terminal terpisah:
    ```bash
    npm run dev
    ```
3. **Akses aplikasi** melalui URL yang dikonfigurasi di Laragon (biasanya `http://management-cleaning-service.test`)

## Testing API Endpoints

### Register User (Customer)

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Register Admin

```bash
curl -X POST http://localhost:8000/api/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "admin_secret_key": "admin-secret-key-change-in-production"
  }'
```

### Get Services (Public)

```bash
curl http://localhost:8000/api/services
```

## Troubleshooting

### Error: "SQLSTATE[HY000] [14] unable to open database file"

-   Pastikan file `database/database.sqlite` sudah ada
-   Pastikan folder `database` memiliki permission write

### Error: "Vite requires Node.js version 20.19+ or 22.12+"

-   Update Node.js ke versi yang sesuai
-   Atau gunakan `nvm` untuk mengelola versi Node.js

### Error: "Class 'App\Http\Controllers\Controller' not found"

-   Jalankan: `composer dump-autoload`

### Error: "Route [login] not defined"

-   Pastikan sudah menjalankan `php artisan migrate`
-   Clear cache: `php artisan config:clear && php artisan route:clear && php artisan cache:clear`

### Frontend tidak ter-load

-   Pastikan Vite dev server sudah running (`npm run dev`)
-   Pastikan `APP_URL` di `.env` sesuai dengan URL yang digunakan
-   Check browser console untuk error

## Perintah Berguna

```bash
# Clear semua cache
php artisan optimize:clear

# Rebuild cache
php artisan config:cache
php artisan route:cache

# Reset database (HATI-HATI: akan menghapus semua data)
php artisan migrate:fresh

# Lihat semua route
php artisan route:list

# Tinker (interactive shell)
php artisan tinker
```

## Struktur Project

```
management-cleaning-service/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/     # API Controllers
│   │   ├── Middleware/          # Custom Middleware
│   │   └── Requests/            # Form Request Validation
│   └── Models/                  # Eloquent Models
├── database/
│   ├── migrations/              # Database Migrations
│   └── database.sqlite         # SQLite Database (default)
├── resources/
│   ├── js/                      # React/TypeScript Frontend
│   │   ├── api/                 # API Services
│   │   ├── components/          # React Components
│   │   ├── pages/               # Page Components
│   │   └── types/               # TypeScript Types
│   └── views/                   # Blade Templates
├── routes/
│   ├── api.php                  # API Routes
│   └── web.php                  # Web Routes (SPA fallback)
└── public/                       # Public Assets
```

## Default Roles

Aplikasi ini memiliki 3 role:

-   **admin**: Full access ke semua fitur
-   **customer**: Bisa membuat booking (register via `/register`)
-   **cleaner**: Bisa melihat dan update status booking (dibuat oleh admin via panel)

### Membuat User Admin

**Opsi 1: Via Web Interface (Recommended)**

1. Buka halaman: `http://localhost:8000/register/admin`
2. Isi form dengan data admin
3. Masukkan `ADMIN_SECRET_KEY` yang ada di file `.env`
4. Submit form

**Opsi 2: Via API**

```bash
curl -X POST http://localhost:8000/api/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "admin_secret_key": "admin-secret-key-change-in-production"
  }'
```

**Opsi 3: Via Tinker (Development)**

```bash
php artisan tinker
```

Kemudian:

```php
$user = App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@example.com',
    'password' => Hash::make('password123'),
    'role' => 'admin'
]);
```

### Membuat User Cleaner

Cleaner **TIDAK** memiliki halaman register publik. Cleaner dibuat oleh admin melalui:

-   Panel Admin → Cleaners → Tambah Cleaner
-   Atau via API: `POST /api/admin/cleaners` (requires admin authentication)

### Keamanan Admin Secret Key

⚠️ **PENTING**: Ganti `ADMIN_SECRET_KEY` di file `.env` dengan secret key yang kuat sebelum production!

## Support

Jika mengalami masalah, pastikan:

1. Semua dependencies sudah terinstall
2. Database sudah di-migrate
3. Environment file sudah dikonfigurasi dengan benar
4. Port 8000 dan 5173 tidak digunakan aplikasi lain
