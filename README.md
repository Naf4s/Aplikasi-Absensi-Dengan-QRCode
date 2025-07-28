# SI-Absen: Sistem Informasi Absensi

A comprehensive web-based attendance management system designed for educational institutions. It features a React frontend and a Node.js backend, providing a seamless experience for managing student, class, and attendance data.

## Features

### Frontend (React + TypeScript)

-   **Dashboard:** At-a-glance view of key statistics, including daily attendance percentage, total students, and weekly attendance trends.
-   **Attendance Management:**
    -   Manually mark student attendance (Present, Sick, Permit, Absent).
    -   Real-time QR code scanning for quick check-ins.
    -   View daily attendance status by class.
-   **Student Management:**
    -   Full CRUD operations for student data.
    -   Bulk import students from Excel files.
    -   Generate and export individual or bulk QR codes for students.
-   **Class Management:**
    -   Full CRUD operations for classes.
    -   Assign homeroom teachers to classes.
    -   Student promotion system to move students to the next grade.
-   **User Management:**
    -   CRUD for system users (e.g., Admin, Teacher).
    -   Role-based access control to protect sensitive operations.
-   **Reporting:**
    -   Generate detailed monthly and class-based attendance reports.
    -   Filter reports by class, date, and status.
    -   Export reports to Excel or print-friendly formats.
-   **Communication:**
    -   Send WhatsApp notifications to parents for absent students.
-   **Content Management:**
    -   Manage school news/announcements.
    -   Manage school program information.
-   **System Settings:**
    -   Configure academic year and semester.
    -   Integrate with WhatsApp via QR code scanning.

### Backend (Node.js)

-   RESTful API for all frontend features.
-   JWT-based authentication and authorization.
-   Database integration for storing all application data.
-   Handles QR code validation and attendance recording.
-   WhatsApp integration for sending notifications.
-   Bulk data processing for student imports.

## Tech Stack

-   **Frontend:**
    -   React
    -   TypeScript
    -   Tailwind CSS
    -   Axios
    -   Chart.js
    -   React Router

-   **Backend:**
    -   Node.js
    -   Express.js (Likely)
    -   A relational database like PostgreSQL or MySQL (Likely)
    -   Prisma or another ORM (Likely)

## Getting Started

### Prerequisites

-   Node.js (v18.x or later recommended)
-   npm or yarn
-   A running instance of the backend server.

### Frontend Setup

1.  Navigate to the frontend directory:
    ```sh
    cd fe-absensi-app
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `fe-absensi-app` directory and add the backend API URL. The variable name might differ based on your Vite configuration (e.g., `VITE_API_BASE_URL`).
    ```
    VITE_API_BASE_URL=http://localhost:5000/api
    ```
4.  Start the development server:
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:5173` (or another port if specified).

### Backend Setup

1.  Navigate to the backend directory:
    ```sh
    cd backend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Set up your database and create a `.env` file with the necessary environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`, etc.).
4.  Run database migrations (if applicable).
5.  Start the server:
    ```sh
    npm start
    ```
    The backend API should now be running on `http://localhost:5000`.

## Folder Structure

```
siabsen/
├── backend/
│   └── ... (backend source files)
└── fe-absensi-app/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── lib/
    │   └── pages/
    └── ... (config files like package.json, vite.config.ts)
```