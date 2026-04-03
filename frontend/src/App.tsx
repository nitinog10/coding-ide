import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { EditorProvider } from './contexts/EditorContext';
import Editor from './pages/Editor';

function App() {
  return (
    <Router>
      <EditorProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Editor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </EditorProvider>
    </Router>
  );
}

export default App;
