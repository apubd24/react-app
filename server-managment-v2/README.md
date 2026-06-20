Importent Note: Ip address and Serial will be unique


# AdminPro Dashboard (React Frontend)

A production-ready admin panel for managing users and devices, built with React, Vite, and Tailwind CSS.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18.0 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Getting Started

Follow these steps to get the project running locally:

### 1. Clone or Download the Project
Download the project files to your local machine.

### 2. Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your backend API URL. You can use `.env.example` as a template:
```bash
cp .env.example .env
```
Then, update the value in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 4. Run the Development Server
Start the development server with:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Production Build

To create an optimized production build, run:
```bash
npm run build
```
The output files will be generated in the `dist/` directory, which can be served by any static web server (Nginx, Apache, etc.).

## Project Features

- **Authentication**: JWT-based login integration.
- **Dashboard**: Interactive data visualization using Recharts.
- **User Management**: Full CRUD (Create, Read, Update, Delete) for users.
- **Device Inventory**: Manage network devices and track their status.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
- **API Integration**: Centralized Axios service with request/response interceptors.

## Backend Requirement

This frontend is designed to connect to a **Golang (Gin) API**. Ensure your backend is running at the URL specified in your `.env` file for the application to function correctly.
