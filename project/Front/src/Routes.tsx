import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import EditarEmpleado from './EditarEmpleado';
import AgregarEmpleado from './AgregarEmpleado';
import CrearDept from './CrearDept';
import InfoE from './InfoEmpleado';
import EditarDept from './EditarDept';
import InfoDept from './InfoDept';
// Asegúrate de tener este componente

function RoutesApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ee" element={<EditarEmpleado />} />
        <Route path="/ae" element={<AgregarEmpleado />} />
        <Route path="/cd" element={<CrearDept />} />
        <Route path="/ie" element={<InfoE/>} />
        <Route path ="/ed" element={<EditarDept/>}/>
        <Route path ="/id" element={<InfoDept/>}/>

      </Routes>
    </Router>
  );
}

export default RoutesApp;
