# -*- coding: utf-8 -*-

from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.debug = True

# URI de conexión a MongoDB Atlas
uri = "mongodb+srv://andrespaz2002:andresitO11@cluster0.keybj.mongodb.net/aether_solutions?retryWrites=true&w=majority"
client = MongoClient(uri)

# Seleccionar la base de datos
db = client['aether_solutions']
# Seleccionar la colección
employee_collection = db['employee']
department_collection = db['departments']  

# Función para verificar si el departamento existe
def check_department(department_name):
    return department_collection.find_one({"name": department_name}) is not None


# Ruta para obtener todos los empleados (GET)
@app.route('/api/employees', methods=['GET'])
def get_employees():
    department_name = request.args.get('departmentName')
    query = {}
    if department_name:
        # Obtener el departamento para encontrar los miembros
        department = department_collection.find_one({"name": department_name})
        if department:
            # Filtrar por los empleados que están en la lista de 'members' del departamento
            members = department.get('members', [])
            query['cedula'] = {"$in": members}  # Filtra por las cédulas que están en 'members'
        else:
            return jsonify({'message': 'Departamento no encontrado'}), 404

    employees = employee_collection.find(query)
    result = []
    for employee in employees:
        result.append({
            "id": str(employee["_id"]),
            "name": employee['name'],
            "lastname": employee['lastname'],
            "cedula": employee['cedula'],
            "departamento": employee['departamento'],
            "is_supervisor": employee.get('is_supervisor', False),
        })
    return jsonify(result)


@app.route('/api/employees', methods=['POST'])
def create_employee():
    data = request.get_json()

    # Verificación de campos requeridos
    if 'name' not in data or 'cedula' not in data or 'departamento' not in data:
        return jsonify({'message': 'Name, Cedula and Departamento are required'}), 400

    # Verificar si la cédula ya existe en la colección
    existing_employee = employee_collection.find_one({"cedula": data['cedula']})
    if existing_employee:
        return jsonify({'message': 'La cédula ya está registrada'}), 400

    # Verificar si el departamento existe
    department = department_collection.find_one({"name": data['departamento']})
    if not department:
        return jsonify({'message': 'El departamento no existe'}), 400

    # Determinar si el empleado es jefe (supervisor)
    is_supervisor = data.get('is_supervisor')

    if is_supervisor:
        # Verificar si ya hay un jefe en el departamento
        if department.get('supervisor'):
            return jsonify({'message': 'Ya existe un jefe en este departamento'}), 400

    # Crear un nuevo empleado con el campo 'is_supervisor'
    new_employee = {
        "name": data['name'],
        "lastname": data.get('lastname', ''),  # Opcional si no siempre se envía
        "cedula": data['cedula'],
        "departamento": data['departamento'],
        "is_supervisor": is_supervisor  # Campo correcto
    }

    # Insertar el nuevo empleado en la base de datos
    employee_collection.insert_one(new_employee)
    department_collection.update_one(
        {"name": data['departamento']},
        {"$addToSet": {"members": data['cedula']}}  # Agregar empleado al departamento
    )

    # Si el empleado es jefe, actualizar el departamento para establecerlo como supervisor
    if is_supervisor:
        department_collection.update_one(
            {"name": data['departamento']},
            {"$set": {"supervisor": data['cedula']}}  # Establecer al jefe
        )

    return jsonify({"message": "Empleado creado con éxito"}), 201



@app.route('/api/employees/<cedula>', methods=['GET'])
def buscar_cedula(cedula):
    employee = employee_collection.find_one({"cedula": cedula})
    
    if not employee:
        return jsonify({"message": "Empleado no encontrado"}), 404

    # Datos básicos del empleado
    empleado_data = {
        "name": employee["name"],
        "lastname": employee["lastname"],
        "cedula": employee["cedula"],
        "departamento": employee["departamento"],
        "isSupervisor": employee.get("is_supervisor", False),
    }

    # Si el empleado es supervisor, buscar sus subordinados
    if empleado_data["isSupervisor"]:
        subordinados = employee_collection.find({"departamento": employee["departamento"], "is_supervisor": False})
        empleado_data["subordinates"] = [
            {"name": sub["name"], "lastname": sub["lastname"], "cedula": sub["cedula"]}
            for sub in subordinados
        ]
    else:
        # Si no es supervisor, buscar su supervisor
        department = department_collection.find_one({"name": employee["departamento"]})
        if department and department.get("supervisor"):
            supervisor = employee_collection.find_one({"cedula": department["supervisor"]})
            if supervisor:
                empleado_data["supervisor"] = {
                    "name": supervisor["name"],
                    "lastname": supervisor["lastname"],
                    "cedula": supervisor["cedula"],
                }
    
    return jsonify(empleado_data), 200


#actualizar los datos con la cedula de parametro

@app.route('/api/employees/<cedula>', methods=['PUT'])
def actualizar_empleado(cedula):
    data = request.get_json()

    # Verificar si el departamento enviado existe
    new_department = data.get("departamento", "")
    if not check_department(new_department):
        return jsonify({"message": "El departamento no existe."}), 400

    # Buscar el empleado actual para obtener el departamento anterior
    employee = employee_collection.find_one({"cedula": cedula})
    if not employee:
        return jsonify({"message": "Empleado no encontrado."}), 404

    old_department = employee.get("departamento")  # Departamento anterior
    is_supervisor = employee.get("is_supervisor", False)

    # Preparar datos para actualizar
    updated_data = {k: v for k, v in data.items() if v is not None}
    updated_data.pop('cedula', None)  # No permitimos cambiar la cédula

    try:
        # Iniciar la transacción para modificar ambas colecciones
        with client.start_session() as session:
            with session.start_transaction():
                # Si el departamento ha cambiado, actualizar las colecciones
                if old_department != new_department:
                    # Si el empleado es un supervisor y cambia de departamento,
                    # eliminarlo como supervisor del departamento anterior
                    if is_supervisor:
                        department_collection.update_one(
                            {"name": old_department},
                            {"$unset": {"supervisor": ""}},
                            session=session
                        )

                    # Quitar la cédula del departamento anterior
                    if old_department:
                        department_collection.update_one(
                            {"name": old_department},
                            {"$pull": {"members": cedula}},
                            session=session
                        )

                    # Agregar la cédula al nuevo departamento
                    department_collection.update_one(
                        {"name": new_department},
                        {"$addToSet": {"members": cedula}},
                        session=session
                    )

                # Actualizar el documento del empleado en la colección
                result = employee_collection.update_one(
                    {"cedula": cedula},
                    {"$set": updated_data},
                    session=session
                )

        if result.modified_count > 0:
            return jsonify({"message": "Empleado y departamento actualizados exitosamente."}), 200
        else:
            return jsonify({"message": "No se realizaron cambios."}), 200

    except Exception as e:
        
        return jsonify({"message": "Ocurrió un error al actualizar el empleado."}), 500


@app.route('/api/departments', methods=['POST'])
def create_department():
    data = request.get_json()
    department_name = data.get('name')
    department_description = data.get('description')

    # Verificar si el departamento ya existe
    existing_department = department_collection.find_one({"name": department_name})
    if existing_department:
        return jsonify({"message": "El departamento ya existe."}), 400

    # Crear el nuevo departamento
    department_collection.insert_one({
        "name": department_name,
        "description": department_description,
        "members":[]

    })

    return jsonify({"message": "Departamento creado exitosamente."}), 201

# Ruta para obtener todos los departamentos (GET)
@app.route('/api/departments', methods=['GET'])
def get_departments():
    try:
        departments = department_collection.find()
        result = []
        for department in departments:
            result.append({
                "id": str(department["_id"]),
                "name": department["name"],
                "description": department.get("description", ""),
                "members": department.get("members", []),
                "supervisor": department.get("supervisor", None)
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "No se pudo obtener la lista de departamentos"}), 500

@app.route('/api/departments/<string:department_name>/supervisor', methods=['GET'])
def check_supervisor(department_name):
    # Buscar el departamento en la colección
    department = department_collection.find_one({"name": department_name})
    
    # Verificar si hay un supervisor
    if department and department.get("supervisor"):
        return jsonify({"hasSupervisor": True})  # Ya tiene supervisor
    else:
        return jsonify({"hasSupervisor": False})  # No tiene supervisor

@app.route('/api/employees/<cedula>', methods=['DELETE'])
def delete_employee(cedula):
    # Buscar el empleado por cédula
    employee = employee_collection.find_one({"cedula": cedula})
    
    if not employee:
        return jsonify({"message": "Empleado no encontrado"}), 404

    # Obtener el departamento del empleado
    department_name = employee.get("departamento")
    
    if department_name:
        # Eliminar la cédula del empleado de la lista de miembros del departamento
        department_collection.update_one(
            {"name": department_name},
            {"$pull": {"members": cedula}}  # Quitar al empleado de la lista de miembros
        )

    # Eliminar el empleado de la colección 'employee'
    employee_collection.delete_one({"cedula": cedula})

    return jsonify({"message": "Empleado eliminado exitosamente"}), 200

@app.route('/api/departments/<string:department_name>/supervisor', methods=['PUT'])
def update_supervisor(department_name):
    department = department_collection.find_one({"name": department_name})
    if not department:
        return jsonify({"message": "Departamento no encontrado"}), 404

    supervisor = request.get_json().get("supervisor")
    # Actualizar el supervisor
    department_collection.update_one(
        {"name": department_name},
        {"$set": {"supervisor": supervisor}}
    )

    return jsonify({"message": "Supervisor actualizado"}), 200

if __name__ == '__main__':
app.run(host='0.0.0.0', port=5000)
