import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import './DashboardLayout.css';

/**
 * Layout representing the dashboard frame, including top navbar,
 * sidebar on the left, and nested route components in the content area.
 *
 * @returns {JSX.Element}
 */
const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
