import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * HomePage serves as the landing route router. It checks the active session
 * and redirects the user to the correct role dashboard, or to /login.
 *
 * @returns {null}
 */
const HomePage = () => {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitializing) return;

    if (user) {
      switch (user.role) {
        case 'EMPLOYEE':
          navigate('/employee', { replace: true });
          break;
        case 'MANAGER':
          navigate('/manager', { replace: true });
          break;
        case 'FINANCE':
          navigate('/finance', { replace: true });
          break;
        case 'ADMIN':
          navigate('/admin', { replace: true });
          break;
        default:
          navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [user, isInitializing, navigate]);

  return null;
};

export default HomePage;
export { HomePage };
