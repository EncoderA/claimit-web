import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import HomePage from '../pages/Home/HomePage';
import EmployeeDashboard from '../pages/Employee/EmployeeDashboard';
import ManagerDashboard from '../pages/Manager/ManagerDashboard';
import FinanceDashboard from '../pages/Finance/FinanceDashboard';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import LoginPage from '../pages/Login/LoginPage';
import ResetPasswordPage from '../pages/Login/ResetPasswordPage';
import UnauthorizedPage from '../pages/Unauthorized/UnauthorizedPage';
import ExpenseSubmission from '../pages/ExpenseSubmission';

import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import { ROLES } from '../config/roles.config';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: <HomePage />,
  },
  {
    element: <DashboardLayout />,
    children: [

      {
        element: <ProtectedRoute allowedRoles={[ROLES.EMPLOYEE]} />,
        children: [
          {
            path: '/employee',
            element: <EmployeeDashboard />,
          },
          {
            path: '/employee/submit-expense',
            element: <ExpenseSubmission />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[ROLES.MANAGER]} />,
        children: [
          {
            path: '/manager',
            element: <ManagerDashboard />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[ROLES.FINANCE]} />,
        children: [
          {
            path: '/finance',
            element: <FinanceDashboard />,
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
        children: [
          {
            path: '/admin',
            element: <AdminDashboard />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
