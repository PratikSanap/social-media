import { RouterProvider } from 'react-router-dom';
import { router } from './routes/Allroutes.jsx';
import { UserProvider } from './api/UserContext.jsx';
import './styles/global.css';
import './styles/index.css';

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
