import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EditarEmpleado.css';

const CrearEmpleado: React.FC = () => {
  const [cedula, setCedula] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [dept, setDept] = useState('');
  const [cargo, setCargo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null); // Mover esta línea aquí

  // Función para alternar el menú
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu); // Si ya está abierto, lo cerramos; si no, lo abrimos
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos
    if (!cedula || !name || !lastname || !dept || !cargo) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    try {
      // Enviar los datos a la API de Flask
      const response = await axios.post('http://127.0.0.1:5000/api/employees', {
        cedula: cedula,
        name: name,
        lastname : lastname,
        dept : dept,
        cargo: cargo,
      });

      if (response.status === 201) {
        setErrorMessage('Empleado creado exitosamente.');
        // Limpiar campos del formulario si la creación fue exitosa
        setCedula('');
        setName('');
        setLastname('');
        setDept('');
        setCargo('');
      } else {
        setErrorMessage('Error al crear el empleado.');
      }
    } catch (error: unknown) {
        // Verificar si el error es un AxiosError y si tiene la respuesta
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.data.message) {
            // Mostrar el mensaje de la API, por ejemplo, "La cédula ya está registrada"
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage('Error de conexión con la API.');
          }
        } else {
          setErrorMessage('Error desconocido.');
        }
      }

    }

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
                  <li><Link to="/ae">Agregar Empleado</Link></li>
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
      <div className="form-container">
        <h2 className="titulo">Usuario Nuevo</h2>
        <form id="busquedaCedula" onSubmit={handleSubmit}>
          <div className="input">
            <label htmlFor="id">Cédula</label>
            <input
              type="text"
              id="id"
              name="id"
              placeholder="Ingresar cédula..."
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              pattern="^\d+$"
              title="Solo números"
              required
            />
          </div>
          <div className="input">
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ingrese su nombre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input">
            <label htmlFor="lastname">Apellido</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              placeholder="Ingrese su apellido..."
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
          </div>
          <div className="input">
            <label htmlFor="dept">Departamento</label>
            <input
              type="text"
              id="dept"
              name="dept"
              placeholder="Ingrese su Departamento..."
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              required
            />
          </div>
          <div className="input">
            <label htmlFor="cargo">Cargo</label>
            <input
              type="text"
              id="cargo"
              name="cargo"
              placeholder="Ingrese su cargo en el departamento..."
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-submit">Crear</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default CrearEmpleado;

