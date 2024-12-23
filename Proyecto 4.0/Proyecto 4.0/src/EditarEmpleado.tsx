import { Link } from 'react-router-dom';
import { useState } from 'react';

function EditarEmpleado() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu); // Si ya está abierto, lo cerramos; si no, lo abrimos
  };

  return (
    <div>
      <header>
        <nav>
          <div className="logo">Gestión de Departamentos y Empleados</div>
          <ul className="menu">
            <li><Link to="/">Inicio</Link></li>

            {/* Menú de Empleados */}
            <li className={`menu-item ${openMenu === 'empleados' ? 'open' : ''}`}>
              <a href="#" onClick={() => toggleMenu('empleados')}>Empleados</a>
              {openMenu === 'empleados' && (
                <ul className="sub_menu_empleados">
                  <li><Link to="/ee">Editar Empleado</Link></li>
                  <li><Link to="#">Agregar Empleado</Link></li>
                  <li><Link to="#">Todos los Empleados</Link></li>
                </ul>
              )}
            </li>

            {/* Menú de Departamentos */}
            <li className={`menu-item ${openMenu === 'departamentos' ? 'open' : ''}`}>
              <a href="#" onClick={() => toggleMenu('departamentos')}>Departamentos</a>
              {openMenu === 'departamentos' && (
                <ul className="sub_menu_departamentos">
                  <li><Link to="#">Editar Departamento</Link></li>
                  <li><Link to="#">Agregar Departamento</Link></li>
                  <li><Link to="#">Todos los Departamentos</Link></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
}

export default EditarEmpleado;
