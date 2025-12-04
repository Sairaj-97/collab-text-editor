import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import EditorPage from './pages/EditorPage.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/documents/:docId" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
