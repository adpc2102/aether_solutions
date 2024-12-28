import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EditarEmpleado.css';

const InfoDept: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]); // Array para guardar los departamentos
  const [selectedDepartment, setSelectedDepartment] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]); // Array para guardar los empleados
  const [supervisor, setSupervisor] = useState<any | null>(null); // Guardar el supervisor

  // Función para alternar el menú
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Obtener todos los departamentos al montar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/api/departments')
      .then(response => {
        setDepartments(response.data); // Guardamos los departamentos en el estado
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });
  }, []);

// Función para manejar la selección de un departamento
const handleSelectDepartment = (deptId: string) => {
    const department = departments.find((dept) => dept.id === deptId);
    setSelectedDepartment(department);

    if (department) {
      // Pasamos el nombre del departamento en lugar de su ID
      axios.get(`http://localhost:5000/api/employees?departmentName=${department.name}`)
        .then(response => {
          setEmployees(response.data);

          // Buscar el supervisor
          const supervisorCedula = department.supervisor;
          if (supervisorCedula) {
            const supervisor = response.data.find((emp: any) => emp.cedula === supervisorCedula);
            setSupervisor(supervisor || null);
          } else {
            setSupervisor(null);
          }
        })
        .catch(error => {
          console.error('Error fetching employees:', error);
        });
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
                  <li><Link to="/ie">Información</Link></li>
                  <li><Link to="/ee">Editar Empleado</Link></li>
                  <li><Link to="/ae">Agregar Empleado</Link></li>
                </ul>
              )}
            </li>
            <li className={`menu-item ${openMenu === 'departamentos' ? 'open' : ''}`}>
              <a href="#" onClick={() => toggleMenu('departamentos')}>Departamentos</a>
              {openMenu === 'departamentos' && (
                <ul className="sub_menu_departamentos">
                  <li><Link to="/id">Información</Link></li>
                  <li><a href="/ed">Editar Departamento</a></li>
                  <li><Link to="/cd">Crear Departamento</Link></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </header>

      <div className="form-container">
        <h2>Información Departamento</h2>
        <form>
          <div className="input">
            <label>Departamentos</label>
            <select
              onChange={(e) => handleSelectDepartment(e.target.value)}
              value={selectedDepartment ? selectedDepartment.id : ''}
            >
              <option value="">Seleccionar un departamento</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </form>

        {selectedDepartment && (
          <div className="subordinate-list">
            <h3>Información del Departamento:</h3>
            <p><strong>Nombre:</strong> {selectedDepartment.name}</p>

            {supervisor ? (
              <p><strong>Supervisor:</strong> {supervisor.name} {supervisor.lastname}</p>
            ) : (
              <p>No hay supervisor asignado a este departamento.</p>
            )}

            <h4>Empleados:</h4>
            {employees.length > 0 ? (
              <ul>
                {employees.map((emp: any) => (
                  <li key={emp.id}>
                    {emp.name} {emp.lastname}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay empleados en este departamento</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoDept;
