import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

/**
 * Main application component wrapping routers with Auth context.
 *
 * @returns {JSX.Element}
 */
const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
export { App };
