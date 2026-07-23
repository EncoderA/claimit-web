# ClaimIt Frontend

This is the frontend application for the **ClaimIt – Smart Expense & Reimbursement Platform**. It is built using **React** and **Vite** and provides the user interface for Employees, Managers, Finance, and Administrators to manage expense reimbursement workflows.

---

## Tech Stack

- React
- Vite
- React Router DOM
- JavaScript
- CSS
- Axios

---

## Project Setup

Clone the repository and install the dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

The application will run at:

```
http://localhost:5173
```

To create a production build:

```bash
npm run build
```

---

## Folder Structure

```
src
│
├── assets
├── components
│   ├── Button
│   ├── Card
│   ├── CurrencyInput
│   ├── DatePickerField
│   ├── FormField
│   ├── Navbar
│   ├── ReceiptUpload
│   ├── SelectField
│   ├── Sidebar
│   ├── StatusChip
│   ├── Stepper
│   └── Table
│
├── config
├── constants
├── context
├── hooks
├── layouts
├── pages
├── routes
├── services
├── styles
├── utils
├── App.jsx
└── main.jsx
```

---

## Application Pages

The application currently includes:

- Home
- Login
- Employee Dashboard
- Manager Dashboard
- Finance Dashboard
- Admin Dashboard
- Expense Submission
- Unauthorized

---

## Expense Submission Flow

The Expense Submission module includes:

- Multi-line expense entry
- Add and remove expense rows
- Receipt upload with image preview
- Save draft using localStorage
- Automatic draft restoration across sessions
- Inline form validation
- Policy violation warnings
- Responsive layout
- Date picker for expense date selection

> **Note:** Backend APIs are currently under development. The module uses local React state and localStorage, and is structured for easy backend integration.

---

## Reusable Components

The project currently provides reusable UI components including:

- Button
- Card
- CurrencyInput
- DatePickerField
- FormField
- Navbar
- ReceiptUpload
- SelectField
- Sidebar
- StatusChip
- Stepper
- Table

These components are designed to be shared across multiple modules of the application.

---

## Routing

The application uses **React Router DOM** for client-side routing.

Protected routes are implemented for:

- Employee
- Manager
- Finance
- Admin

Authentication and authorization are handled using React Context.

---

## Theme

The application uses a centralized styling approach to maintain consistent:

- Colors
- Typography
- Spacing
- Component styling

Theme-related files are located inside the `styles` folder.

---

## Current Status

Completed:

- React application scaffold
- Project architecture
- Shared reusable components
- Routing configuration
- Authentication context
- Dashboard layouts
- Expense Submission Flow
- Docker configuration
- Responsive UI foundation

---

