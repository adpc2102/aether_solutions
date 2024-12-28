# aether_solutions
Este es un programa de gestión de empleados y departamentos.
Pasos realizados:
* Iniciar el proyecto instalando las librerias y dependencias para poder utilizar Vite, React, TypeScript, MongoDB, Express y Python
* Sub dividi el Backend y Frontend en dos carpetas
* Backend es basicamente todas las peticiones HTTPS que realiza la API para conectarse con la base de datos, esta llevada a cabo en Python
* Frontend son las diferentes interfaces que tienen interacción directa con el usuario y fueron realizada en TypeScript
# Explicación de cada Interfaz
* Inicio
Es la presentación del sitio web en la cual doy una breve introducción acerca de lo que es el sitio y tiene un boton en el cual tendras información de contacto sobre mi
* Editar Empleado
Nos solicitan la cedula de algun empleado ya antes registrado, solo podras editar su departamento y el puesto que este ocupa dentro del mismo
* Agregar Empleado
Nos solicitan nombre,apellido,cedula,departamento y cargo, se verifica que no estes registrado anteriormente y se procede a registrar al nuevo empleado
* Mostrar empleados
Nos mostrara todos los empleados Registrados en la Base de Datos