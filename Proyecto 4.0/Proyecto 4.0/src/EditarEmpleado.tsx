import { Link } from 'react-router-dom';
import { useState } from 'react';
import './EditarEmpleado.css'

function EditarEmpleado() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [cedula, setCedula] = useState<string>('');


  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu); // Si ya está abierto, lo cerramos; si no, lo abrimos
  };
  const validarCedula= (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Reemplazamos cualquier caracter que no sea un número
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setCedula(onlyNumbers); // Actualizamos el estado solo con números
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
      <div className='form-container' >
        <h2 className='titulo'>Escriba la cédula del empleado</h2>
          <form id= "busquedaCedula" action="#">
            <div className='input'>
              <label htmlFor="name">Cédula</label>
              <input type="text"
              id="id"
              name="id"
              placeholder="Ingresar cédula..."
              value={cedula}
              onChange={validarCedula} // Maneja el cambio en el campo
              pattern="^\d+$"
              title="Solo números"
              required >
              </input>
            </div>
            <button type="submit" className="btn-submit">Buscar</button>
          </form>
      </div>
    </div>
  );
}

export default EditarEmpleado;
