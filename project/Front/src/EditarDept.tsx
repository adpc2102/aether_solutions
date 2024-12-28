import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EditarEmpleado.css';

const EditarDept: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]); // Array para guardar los departamentos
  const [selectedDepartment, setSelectedDepartment] = useState<any | null>(null);
  const [employees, setEmployees] = useState<any[]>([]); // Array para guardar los empleados
  const [supervisor, setSupervisor] = useState<any | null>(null); // Guardar el supervisor
  const [newSupervisor, setNewSupervisor] = useState<any | null>(null); // Guardar el nuevo supervisor para cambiar

  // Función para alternar el menú
  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Obtener todos los departamentos al montar el componente
  useEffect(() => {
    axios.get('http://localhost:5000/api/departments')
      .then(response => {
        setDepartments(response.data as any[]); // Forzamos el tipo a `any[]`
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
          setEmployees(response.data as any[]);

          // Buscar el supervisor
          const supervisorCedula = department.supervisor;
          if (supervisorCedula) {
            const supervisor = (response.data as any[]).find((emp: any) => emp.cedula === supervisorCedula);
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

  // Eliminar un empleado del departamento
  const handleDeleteEmployee = (cedula: string) => {
    const employeeToDelete = employees.find((emp) => emp.cedula === cedula);
  
    if (employeeToDelete) {
      // Eliminar al empleado de la base de datos
      axios.delete(`http://localhost:5000/api/employees/${cedula}`)
        .then(() => {
          // Actualizar la lista de empleados localmente
          setEmployees((prevEmployees) => prevEmployees.filter(emp => emp.cedula !== cedula));
          
          // Verificar si el empleado eliminado es el supervisor
          if (supervisor?.cedula === employeeToDelete.cedula) {
            // Si es el supervisor, actualizar el supervisor en la base de datos
            axios.put(`http://localhost:5000/api/departments/${selectedDepartment.name}/supervisor`, {
              supervisor: null, // Eliminar el supervisor
            })
            .then(() => {
              setSupervisor(null); // Actualizar el estado local
              setNewSupervisor(null); // Limpiar la selección del nuevo supervisor
            })
            .catch(error => {
              console.error('Error updating supervisor after deletion:', error);
            });
          }
        })
        .catch(error => {
          console.error('Error deleting employee:', error);
        });
    }
  };

  // Cambiar supervisor
  const handleChangeSupervisor = () => {
    if (selectedDepartment && newSupervisor) {
      axios.put(`http://localhost:5000/api/departments/${selectedDepartment.name}/supervisor`, {
        supervisor: newSupervisor.cedula
      })
        .then(() => {
          // Actualizamos el supervisor en el estado local
          setSupervisor(newSupervisor);
          console.log(supervisor);

          // Opcional: Actualizar la lista de empleados, si necesitas reflejar este cambio
          setEmployees((prevEmployees) => 
            prevEmployees.map(emp => 
              emp.cedula === newSupervisor.cedula ? { ...emp, is_supervisor: true } : emp
            )
          );
        })
        .catch(error => {
          console.error('Error updating supervisor:', error);
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
        <h2>Seleccionar Departamento</h2>
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
              <div>
                <p><strong>Supervisor:</strong> {supervisor.name} {supervisor.lastname}</p>
                <div>
                  <h4>Cambiar Supervisor:</h4>
                  <select
                    onChange={(e) => {
                      const supervisor = employees.find(emp => emp.cedula === e.target.value);
                      setNewSupervisor(supervisor || null);
                    }}
                    value={newSupervisor ? newSupervisor.cedula : ''}
                  >
                    <option value="">Seleccionar un nuevo supervisor</option>
                    {employees.map((emp) => (
                      <option key={emp.cedula} value={emp.cedula}>{emp.name} {emp.lastname}</option>
                    ))}
                  </select>
                  <button onClick={handleChangeSupervisor} className='cambiar'>Cambiar Supervisor</button>
                </div>
              </div>
            ) : (
              <div>
                <p>No hay supervisor asignado a este departamento.</p>
                <h4>Asignar un supervisor:</h4>
                <select
                  onChange={(e) => {
                    const supervisor = employees.find(emp => emp.cedula === e.target.value);
                    setNewSupervisor(supervisor || null);
                  }}
                  value={newSupervisor ? newSupervisor.cedula : ''}
                >
                  <option value="">Seleccionar un nuevo supervisor</option>
                  {employees.map((emp) => (
                    <option key={emp.cedula} value={emp.cedula}>{emp.name} {emp.lastname}</option>
                  ))}
                </select>
                <button onClick={handleChangeSupervisor} className='cambiar'>Asignar Supervisor</button>
              </div>
            )}

            <h4>Empleados:</h4>
            {employees.length > 0 ? (
              <ul className="empleados">
                {employees.map((emp: any) => (
                  <li key={emp.cedula} className="empleados2">
                    {emp.name} {emp.lastname}
                    <button onClick={() => handleDeleteEmployee(emp.cedula)} className="borrar">Eliminar</button>
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

export default EditarDept;

