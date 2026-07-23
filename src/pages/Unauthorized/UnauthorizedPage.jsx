import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * UnauthorizedPage shows a 403 Access Denied layout.
 * It provides users with a way to go back to their authorized dashboard.
 *
 * @returns {JSX.Element}
 */
const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (user) {
      switch (user.role) {
        case 'EMPLOYEE':
          navigate('/employee');
          break;
        case 'MANAGER':
          navigate('/manager');
          break;
        case 'FINANCE':
          navigate('/finance');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '50%',
        width: '100px',
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ef4444" style={{ width: '48px', height: '48px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
        </svg>
      </div>
      <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem', color: '#ef4444' }}>403</h1>
      <h2 style={{ fontSize: '1.75rem', margin: '0 0 1rem', color: 'var(--text-h)' }}>Unauthorized Access</h2>
      <p style={{ maxWidth: '500px', fontSize: '1.05rem', color: 'var(--text)', margin: '0 0 2rem', lineHeight: '1.5' }}>
        You do not have the required permissions to view this resource. Your active session remains valid, but this path is restricted.
      </p>
      <button 
        onClick={handleGoBack}
        style={{
          padding: '0.75rem 1.75rem',
          fontSize: '1rem',
          fontWeight: '600',
          color: '#fff',
          backgroundColor: '#aa3bff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px -1px rgba(170, 59, 255, 0.4), 0 2px 4px -1px rgba(170, 59, 255, 0.2)',
          transition: 'transform 0.15s ease, background-color 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#902be5';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#aa3bff';
          e.currentTarget.style.transform = 'none';
        }}
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default UnauthorizedPage;
export { UnauthorizedPage };
