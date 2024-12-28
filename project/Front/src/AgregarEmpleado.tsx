import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EditarEmpleado.css';

const CrearEmpleado: React.FC = () => {
  const [cedula, setCedula] = useState('');
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [dept, setDept] = useState('');
  const [departments, setDepartments] = useState<any[]>([]); // Para almacenar los departamentos
  const [hasSuperior, setHasSuperior] = useState(false); // Para saber si el empleado tiene supervisor
  const [errorMessage, setErrorMessage] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    // Cargar los departamentos de la API al montar el componente
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/departments');
        setDepartments(response.data as any[]);
              } catch (error) {
        setErrorMessage('Error al cargar los departamentos');
      }
    };

    // Cargar los empleados de la API al montar el componente
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/employees');
        console.log(response.data);  // Imprime la respuesta de la API
      } catch (error) {
        setErrorMessage('Error al cargar los empleados');
      }
    };

    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos
    if (!cedula || !name || !lastname || !dept ) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    // Verificar si el departamento ya tiene un supervisor
    const checkSupervisorInDepartment = async (departmentName: string) => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/departments/${departmentName}/supervisor`);
        return (response.data as { hasSupervisor: boolean }).hasSupervisor;
      } catch (error) {
        setErrorMessage('Error al verificar el supervisor en el departamento.');
        return false; // Si ocurre un error, devolvemos false por defecto
      }
    };


    if (hasSuperior) {
      const hasSupervisor = await checkSupervisorInDepartment(dept);
      if (hasSupervisor) {
        setErrorMessage(`El departamento de ${dept} ya tiene un supervisor asignado.`);
        return;
      } else {
        // Si no hay supervisor, asignamos al nuevo empleado como supervisor
      }
    }
    

    try {
      // Enviar los datos a la API de Flask
      const response = await axios.post('http://127.0.0.1:5000/api/employees', {
        cedula: cedula,
        name: name,
        lastname: lastname,
        departamento: dept,
        is_supervisor: hasSuperior, // Si no tiene supervisor, se asigna null
      });

      if (response.status === 201) {
        setErrorMessage('Empleado creado exitosamente.');
        // Limpiar campos del formulario si la creación fue exitosa
        setCedula('');
        setName('');
        setLastname('');
        setDept('');
        setHasSuperior(false);
      } else {
        setErrorMessage('Error al crear el empleado.');
      }
    } catch (error: unknown) {
      // Verificación manual del tipo de error
      if (error instanceof Error) {
        // Si es un error estándar, verificamos si tiene una respuesta de Axios
        if ((error as any).response) {
          // Si la respuesta contiene un mensaje de error
          setErrorMessage((error as any).response.data.message || 'Error desconocido en la respuesta.');
        } else {
          // Otro tipo de error relacionado con la solicitud
          setErrorMessage('Error desconocido en la solicitud.');
        }
      } else {
        // Si no es un error estándar, mostramos un mensaje genérico
        setErrorMessage('Error desconocido.');
      }
    }
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
              <a href="#" onClick={() => setOpenMenu(openMenu === 'empleados' ? null : 'empleados')}>Empleados</a>
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
              <a href="#" onClick={() => setOpenMenu(openMenu === 'departamentos' ? null : 'departamentos')}>Departamentos</a>
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
        <h2 className="titulo">Crear Empleado</h2>
        <form id="crearEmpleado" onSubmit={handleSubmit}>
          <div className="input">
            <label htmlFor="cedula">Cédula</label>
            <input
              type="text"
              id="cedula"
              name="cedula"
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
            <select
              id="dept"
              name="dept"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              required
            >
              <option value="">Seleccionar un departamento</option>
              {departments.map(department => (
                <option key={department.id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          {/* Casilla para verificar si tiene supervisor */}
          <div className="input">
            <label htmlFor="hasSuperior">¿Es Jefe de Area?</label>
            <input
              type="checkbox"
              id="hasSuperior"
              name="hasSuperior"
              checked={hasSuperior}
              onChange={(e) => setHasSuperior(e.target.checked)}
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





