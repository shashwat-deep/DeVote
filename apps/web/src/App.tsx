import { Box } from '@mui/material';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { NavBar } from '@/components/NavBar';
import { CreateBallotPage } from '@/pages/CreateBallotPage';
import { HomePage } from '@/pages/HomePage';
import { ResultsPage } from '@/pages/ResultsPage';
import { VotePage } from '@/pages/VotePage';
import { useThemeMode } from '@/theme/themeMode';

export function App() {
  const { mode } = useThemeMode();

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} theme={mode} />
      <NavBar />
      <Box component="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ballot" element={<CreateBallotPage />} />
          <Route path="/voting" element={<VotePage />} />
          <Route path="/result" element={<ResultsPage />} />
        </Routes>
      </Box>
    </>
  );
}
