import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNavForRole } from '../../config/roles.config';
import './Sidebar.css';

/**
 * Sidebar component that dynamically filters and renders navigation links
 * based on the current user's role configuration.
 *
 * @returns {JSX.Element|null}
 */
const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const navItems = getNavForRole(user.role);

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
