import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

/**
 * Top Navbar component. Renders logo, authenticated user name or fallback UUID,
 * role badge, and a Logout action trigger.
 *
 * @returns {JSX.Element|null}
 */
const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">ClaimIt</div>
      <div className="navbar-user-actions">
        <div className="navbar-user-info">
          {user.email ? (
            <>
              <span className="navbar-user-name">{user.name || 'User'}</span>
              <span className="navbar-user-email">({user.email})</span>
            </>
          ) : (
            <span className="navbar-user-id">
              User ID: {user.id ? `${user.id.substring(0, 8)}...` : 'N/A'}
            </span>
          )}
          <span className="navbar-badge">{user.role}</span>
        </div>
        <button className="navbar-logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
