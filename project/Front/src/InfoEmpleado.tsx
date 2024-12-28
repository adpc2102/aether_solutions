import { useState } from 'react';
import { Link } from 'react-router-dom';
import './EditarEmpleado.css';
import axios from 'axios';

function InfoE() {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [cedula, setCedula] = useState<string>('');
  const [empleado, setEmpleado] = useState<any | null>(null); // Para almacenar los datos del empleado
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Función para validar la cédula y permitir solo números
  const validarCedula = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const onlyNumbers = value.replace(/[^0-9]/g, '');
    setCedula(onlyNumbers); // Actualizamos el estado solo con números
  };

  // Función para manejar la búsqueda del empleado
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Enviar la cédula para buscar el empleado en la API
      const response = await axios.get(`http://127.0.0.1:5000/api/employees/${cedula}`);

      if (response.status === 200) {
        setEmpleado(response.data); // Almacenar los datos del empleado
        setErrorMessage('');
      }
    } catch (error) {
      setEmpleado(null); // Limpiar los datos del empleado si no se encuentra
      setErrorMessage('Empleado no encontrado con esa cédula.');
    }
  };

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
                  <li><Link to="/ed">Editar Departamento</Link></li>
                  <li><Link to="/cd">Crear Departamento</Link></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </header>

      <div className="form-container">
        <h2 className="titulo">Información de empleados</h2>
        <form id="busquedaCedula" onSubmit={handleSearch}>
          <div className="input">
            <label htmlFor="cedula">Cédula</label>
            <input
              type="text"
              id="cedula"
              name="cedula"
              placeholder="Ingresar cédula..."
              value={cedula}
              onChange={validarCedula}
              pattern="^\d+$"
              title="Solo números"
              required
            />
          </div>
          <button type="submit" className="btn-submit">Buscar</button>
        </form>

        {/* Mostrar mensaje de error */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {/* Mostrar los datos del empleado si está registrado */}
        {empleado && (
          <div className="empleado-info">
            <h3>Información del Empleado</h3>
            <p>Nombre: {empleado.name}</p>
            <p>Apellido: {empleado.lastname}</p>
            <p>Departamento: {empleado.departamento}</p>

            {/* Verificar si el empleado es supervisor */}
            {empleado.isSupervisor ? (
        <div>
            <h4>Subordinados:</h4>
                {empleado.subordinates && empleado.subordinates.length > 0 ? (
                <ul className="subordinate-list">
                    {empleado.subordinates.map((subordinate: any, index: number) => (
                    <li key={index}>
                    {subordinate.name} {subordinate.lastname}
                    </li>
                ))}
                </ul>
            ) : (
        <p>No tiene subordinados asignados.</p>
        )}
            </div>
            ) : (
            <p>
                Supervisor: {empleado.supervisor ? `${empleado.supervisor.name} ${empleado.supervisor.lastname}` : 'No asignado.'}
            </p>
            )}
        </div>
        )}
    </div>
</div>
);
}

export default InfoE;

