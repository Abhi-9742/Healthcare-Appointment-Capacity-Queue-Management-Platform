# Healthcare Appointment Capacity & Queue Management Platform

A web-based healthcare management system designed to simplify hospital appointment scheduling, manage doctor availability, organize patient queues, and monitor appointment capacity.

## Project Overview

Hospitals and clinics often face long waiting times, uneven doctor workloads, and inefficient appointment scheduling.

This platform helps manage appointments and doctor availability while reducing scheduling conflicts and improving queue management.

## Key Features

- **Patient Management:** Register, view, update, and delete patient details.
- **Doctor Management:** Manage doctor information and specializations.
- **Department Management:** Organize hospital departments.
- **Doctor Availability:** Configure working days, working hours, breaks, and leave dates.
- **Appointment Booking:** Book appointments based on available time slots.
- **Slot Management:** Generate available slots and prevent double booking.
- **Queue Management:** Add patients to queues and update queue status.
- **Cancellation & Rescheduling:** Cancel or reschedule existing appointments.
- **Appointment History:** Track patient appointment records.
- **Dashboard & Reports:** View daily appointment statistics and department workload.
- **Audit Management:** Maintain records of system activities.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| API Integration | Fetch API |
| API Testing | Postman |
| Development Tools | VS Code, Git, GitHub |

## Project Structure

```text
Healthcare-Appointment-Capacity-Queue-Management-Platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Abhi-9742/Healthcare-Appointment-Capacity-Queue-Management-Platform.git
```

### 2. Navigate to the Project

```bash
cd Healthcare-Appointment-Capacity-Queue-Management-Platform
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
```

Start the backend server:

```bash
npm run dev
```

Backend runs at:

`http://localhost:5001`

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## API Modules

The backend provides REST API endpoints for:

| Module | Base Endpoint |
|---|---|
| Patients | `/api/patients` |
| Doctors | `/api/doctors` |
| Departments | `/api/departments` |
| Availability | `/api/availability` |
| Appointments | `/api/appointments` |
| Queue | `/api/queue` |
| Dashboard | `/api/dashboard` |
| Audit | `/api/audit` |

## Core Objective

The main objective of this project is to develop an appointment slot and queue management system that helps healthcare facilities manage their resources efficiently, reduce patient waiting times, and improve appointment scheduling.

## Future Enhancements

- Patient and doctor authentication
- Automated appointment reminders
- Real-time queue updates
- Advanced analytics and reporting
- Role-based access control

## Author

**Abhishek P Hiremath**

B.E. – Artificial Intelligence and Machine Learning

GitHub: [Abhi-9742](https://github.com/Abhi-9742)