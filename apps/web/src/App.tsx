import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { NavBar } from '@/components/NavBar';
import { ComingSoon } from '@/pages/ComingSoon';
import { HomePage } from '@/pages/HomePage';

// NOTE: A full multi-theme / dark-mode system is introduced in milestone M4.
// This is a minimal light theme so the shell builds and renders.
const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#1565c0' } },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={5000} />
      <NavBar />
      <Box component="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ballot" element={<ComingSoon title="Create Ballot" />} />
          <Route path="/voting" element={<ComingSoon title="Cast Your Vote" />} />
          <Route path="/result" element={<ComingSoon title="Results" />} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
}
