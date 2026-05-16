import { AppRouter } from '@/routes';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import '@/styles/main.scss';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppRouter />
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
