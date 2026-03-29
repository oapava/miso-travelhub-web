import { AppRouter } from '@/routes';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/main.scss';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
