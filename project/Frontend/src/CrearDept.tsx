import React, { useState } from 'react';
import axios from 'axios';  // Asegúrate de tener axios instalado para hacer la solicitud HTTP
import { Link } from 'react-router-dom';
import './EditarEmpleado.css';

function CrearDept() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string>('');  // Estado para el nombre del departamento
  const [descripcion, setDescripcion] = useState<string>('');  // Estado para la descripción
  const [errorMessage, setErrorMessage] = useState<string>('');  // Estado para los mensajes de error
  const [successMessage, setSuccessMessage] = useState<string>('');  // Estado para los mensajes de éxito

  // Función para alternar el menú
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu); // Si ya está abierto, lo cerramos; si no, lo abrimos
  };

  // Función para manejar la creación del departamento
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación simple de los campos
    if (!nombre || !descripcion) {
      setErrorMessage('Por favor, complete todos los campos.');
      return;
    }

    try {
      // Enviar la solicitud para crear el nuevo departamento
      const response = await axios.post('http://127.0.0.1:5000/api/departments', {
        name: nombre,
        description: descripcion
      });

      if (response.status === 201) {
        setSuccessMessage('Departamento creado exitosamente.');
        setErrorMessage(''); // Limpiar el mensaje de error
        // Limpiar los campos del formulario después de guardar
        setNombre('');
        setDescripcion('');
      } else {
        setErrorMessage('Hubo un error al crear el departamento.');
      }
    } catch (error) {
      setErrorMessage('Error al conectarse con la API.');
    }
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
                  <li><Link to="#">Información</Link></li>
                  <li><Link to="/ee">Editar Empleado</Link></li>
                  <li><Link to="/ae">Agregar Empleado</Link></li>
                </ul>
              )}
            </li>
            <li className={`menu-item ${openMenu === 'departamentos' ? 'open' : ''}`}>
              <a href="#" onClick={() => toggleMenu('departamentos')}>Departamentos</a>
              {openMenu === 'departamentos' && (
                <ul className="sub_menu_departamentos">
                  <li><Link to="#">Información</Link></li>
                  <li><a href="#">Editar Departamento</a></li>
                  <li><Link to="/cd">Crear Departamento</Link></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </header>

      {/* Formulario para crear un departamento */}
      <div className="form-container">
        <h2 className="titulo">Crear Nuevo Departamento</h2>
        <form onSubmit={handleCreateDepartment}>
          <div className="input">
            <label htmlFor="nombre">Nombre del Departamento</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Ingrese el nombre del departamento..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              placeholder="Ingrese la descripción del departamento..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit">Guardar</button>
        </form>

        {/* Mostrar mensajes de error o éxito */}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </div>
  );
}

export default CrearDept;
