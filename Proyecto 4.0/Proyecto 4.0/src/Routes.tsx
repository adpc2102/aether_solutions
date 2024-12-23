import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import EditarEmpleado from './EditarEmpleado';
// Asegúrate de tener este componente

function RoutesApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ee" element={<EditarEmpleado />} />
      </Routes>
    </Router>
  );
}

export default RoutesApp;
