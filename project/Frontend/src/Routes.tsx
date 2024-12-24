import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import EditarEmpleado from './EditarEmpleado';
import AgregarEmpleado from './AgregarEmpleado';
// Asegúrate de tener este componente

function RoutesApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ee" element={<EditarEmpleado />} />
        <Route path="/ae" element={<AgregarEmpleado />} />
      </Routes>
    </Router>
  );
}

export default RoutesApp;
