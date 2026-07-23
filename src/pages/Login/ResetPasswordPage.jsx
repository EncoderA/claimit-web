import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resetPasswordRequest } from '../../services/authService';
import './ResetPasswordPage.css';

/**
 * ResetPasswordPage allows first-time login users forced by the policy
 * to change their password using the passwordResetToken.
 */
const ResetPasswordPage = () => {
  const { user, handlePasswordResetSuccess } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const passwordResetToken = sessionStorage.getItem('claimit_password_reset_token');

  // If already fully authenticated, redirect to root
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If no temporary passwordResetToken is found, redirect to login
  if (!passwordResetToken) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await resetPasswordRequest(passwordResetToken, newPassword);
      const userPayload = handlePasswordResetSuccess(data.accessToken, data.refreshToken);
      
      if (userPayload) {
        switch (userPayload.role) {
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
    } catch (err) {
      console.error('Password reset failed:', err);
      if (err.status === 401) {
        // Token expired/invalid - clear from storage and send user to login
        sessionStorage.removeItem('claimit_password_reset_token');
        navigate('/login', { 
          state: { error: 'Your reset token has expired or is invalid. Please log in again.' },
          replace: true 
        });
      } else {
        setError(err.message || 'Password reset failed. Please try again.');
        if (err.validationErrors) {
          const mapped = {};
          err.validationErrors.forEach((ve) => {
            mapped[ve.field] = ve.message;
          });
          setValidationErrors(mapped);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-page-container">
      <div className="reset-card">
        <div className="reset-header">
          <div className="reset-logo">ClaimIt</div>
          <div className="reset-title">Set New Password</div>
          <div className="reset-subtitle">
            This is your first login. To secure your account, please choose a new password.
          </div>
        </div>

        {error && (
          <div className="reset-error">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="reset-form-group">
            <label className="reset-label" htmlFor="new-password-input">New Password</label>
            <input
              id="new-password-input"
              type="password"
              className={`reset-input ${validationErrors.newPassword ? 'input-invalid' : ''}`}
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            {validationErrors.newPassword && (
              <span className="field-error-msg">{validationErrors.newPassword}</span>
            )}
          </div>

          <div className="reset-form-group">
            <label className="reset-label" htmlFor="confirm-password-input">Confirm Password</label>
            <input
              id="confirm-password-input"
              type="password"
              className="reset-input"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="password-rules-note">
            <div className="rule-item">✓ At least 8 characters</div>
            <div className="rule-item">✓ Must match password confirmation</div>
          </div>

          <button
            type="submit"
            className="reset-button"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting password...' : 'Update Password & Enter App'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
export { ResetPasswordPage };
