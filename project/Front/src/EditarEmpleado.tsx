import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './EditarEmpleado.css'

function EditarEmpleado() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [cedula, setCedula] = useState<string>('');
  const [empleado, setEmpleado] = useState<any | null>(null); // Para almacenar los datos del empleado
  const [errorMessage, setErrorMessage] = useState<string>(''); // Para mostrar errores
  const [departments, setDepartments] = useState<any[]>([]); // Para almacenar los departamentos


  useEffect(() => {
    // Cargar los departamentos de la API al montar el componente
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/departments');
        setDepartments(response.data);
      } catch (error) {
        setErrorMessage('Error al cargar los departamentos');
      }
    };

    fetchDepartments();
  }, []);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

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
        setErrorMessage(''); // Limpiar mensaje de error si se encuentra al empleado
      }
    } catch (error) {
      setEmpleado(null); // Limpiar los datos del empleado si no se encuentra
      setErrorMessage('Empleado no encontrado con esa cédula.');
    }
  };

  // Función para manejar la actualización del empleado
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Hacer una solicitud PUT para actualizar el empleado
      const response = await axios.put(`http://127.0.0.1:5000/api/employees/${cedula}`, {
        name: empleado.name,
        lastname: empleado.lastname,
        departamento: empleado.departamento,
        
      });

      if (response.status === 200) {
        setErrorMessage('Empleado actualizado exitosamente.');
      } else {
        setErrorMessage('Error al actualizar el empleado.');
      }
    } catch (error) {
      setErrorMessage('Error de conexión con la API.');
    }
  };

  // Funciones para manejar la edición de los campos
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const value = e.target.value;
    setEmpleado((prevEmpleado: any) => ({
      ...prevEmpleado,
      [field]: value,
    }));
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

      <div className='form-container'>
        <h2 className='titulo'>Búsqueda y Edición de Empleados</h2>
        <form id="busquedaCedula" onSubmit={handleSearch}>
          <div className='input'>
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
            <form onSubmit={handleUpdate}>
              <div className="input">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  value={empleado.name}
                  onChange={(e) => handleChange(e, 'name')}
                  readOnly 
                />
              </div>
              <div className="input">
                <label htmlFor="lastname">Apellido</label>
                <input
                  type="text"
                  id="lastname"
                  value={empleado.lastname}
                  onChange={(e) => handleChange(e, 'lastname')}
                  readOnly 
                />
              </div>
              <div className="input">
              <label htmlFor="dept">Departamento</label>
            <select
              id="departamento"
              value={empleado?.departamento || ''} // Muestra el departamento actual del empleado
              onChange={(e) => handleChange(e, 'departamento')}
            >
              
              {departments.map(department => (
                <option key={department.id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
              </div>
              <button type="submit" className="btn-submit">Actualizar</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditarEmpleado;