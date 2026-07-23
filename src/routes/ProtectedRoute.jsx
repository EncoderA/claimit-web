import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protector that redirects unauthorized users to /login and
 * authenticated users without required roles to /unauthorized.
 *
 * @param {object} props
 * @param {string[]} props.allowedRoles Roles permitted to access the route.
 * @returns {JSX.Element|null}
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return null; // Prevent page flash during session restore
  }

  if (!user) {
    // Save original location in state so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Valid session but lack permissions -> redirect to unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Permitted -> render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
export { ProtectedRoute };
