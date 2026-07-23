import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

/**
 * LoginPage provides user email/password login input.
 * It contains DEV-gated shortcut buttons to speed up manual review and QA.
 *
 * @returns {JSX.Element}
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fromPath = location.state?.from?.pathname || '';

  // Handle redirect state errors (e.g. token expired)
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
      // Clear location state to prevent repeating the alert on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else {
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
            navigate('/', { replace: true });
        }
      }
    }
  }, [user, navigate, fromPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result?.passwordResetRequired) {
        navigate('/reset-password', { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">ClaimIt</div>
          <div className="login-subtitle">Smart Expense & Reimbursement Platform</div>
        </div>

        {error && (
          <div className="login-error">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label" htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              className="login-input"
              placeholder="e.g. employee@claimit.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* 
          Constraint 3: DEV-gated helper shortcuts.
          These are only rendered in Vite's development mode and stripped in production builds.
        */}
        {import.meta.env.DEV && (
          <div className="dev-gated-helpers">
            <div className="dev-helpers-title">Dev Quick-Login Shortcuts</div>
            <div className="dev-buttons-grid">
              <button
                type="button"
                className="dev-helper-btn"
                onClick={() => {
                  setEmail('employee@claimit.com');
                  setPassword('password');
                }}
              >
                Employee
              </button>
              <button
                type="button"
                className="dev-helper-btn"
                onClick={() => {
                  setEmail('manager@claimit.com');
                  setPassword('password');
                }}
              >
                Manager
              </button>
              <button
                type="button"
                className="dev-helper-btn"
                onClick={() => {
                  setEmail('finance@claimit.com');
                  setPassword('password');
                }}
              >
                Finance
              </button>
              <button
                type="button"
                className="dev-helper-btn"
                onClick={() => {
                  setEmail('admin@claimit.com');
                  setPassword('password');
                }}
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
export { LoginPage };
