import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import PaseLista from './PaseLista';
import Layout from './Layout';
import './index.css';   

// ==========================================
// RUTEADOR PRINCIPAL DE LA PWA
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clubes/:clubId/asistencia" element={<PaseLista />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
