import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '~/index.css';
import App from '~/App.jsx';
import theme from '~/theme';

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
    <ToastContainer position="bottom-right" autoClose={3000} />
  </ThemeProvider>
);
