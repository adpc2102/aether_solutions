import { useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function App() {
  // Usamos un único estado para saber cuál menú está abierto
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Función para alternar el menú
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu); // Si ya está abierto, lo cerramos; si no, lo abrimos
  };

  return (
    <div>
    <header>
      <nav>
        <div className="logo">Gestión de Departamentos y Empleados</div>
        <ul className="menu">
          <li><a href="/">Inicio</a></li>
              <li className={`menu-item ${openMenu === 'empleados' ? 'open' : ''}`}>
                 <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('empleados'); }}>Empleados</a>
                    {openMenu === 'empleados' && (
                      <ul className="sub_menu_empleados">
                        <li><Link to="/ie">Información</Link></li>
                        <li><Link to="/ee">Editar Empleado</Link></li>
                        <li><Link to="/ae">Agregar Empleado</Link></li>
                      
                </ul>
              )}
      </li>


          {/* Menú de Departamentos */}
          <li className={`menu-item ${openMenu === 'departamentos' ? 'open' : ''}`}>
            <a href="#" onClick={() => toggleMenu('departamentos')}>Departamentos</a>
              {openMenu === 'departamentos' && (
              <ul className="sub_menu_departamentos">
                <li><Link to="/id">Información</Link></li>
                <li><Link to ="/ed">Editar Departamento</Link></li>
                <li><Link to="/cd">Crear Departamento</Link></li>
                
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </header>
    <div className="info-below-header">
        <h2>Bienvenido a la plataforma de Gestión</h2>
        <p>
          Aquí puedes administrar los empleados y departamentos de la organización.
          Utiliza los menús de navegación para editar, agregar o ver la información.
        </p>
        <button onClick={() => alert("Andrés Daniel Paz Camacho\nCorreo Electronico: andrespaz2002@gmail.com\nNúmero de contacto: 0414-9041585\nGracias por visitarnos!!!")}>Más Información</button>
      </div>
    </div>
    
      
    
  );
}


export default App;