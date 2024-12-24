from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
    # Obtener todos los empleados de la colección
    employees = employee_collection.find()  # Accede a la colección "employee"
    result = []
    for employee in employees:
        print(employee)
        result.append({
            "id": str(employee["_id"]), 
            "name": employee['name'],
            "lastname" : employee['lastname'],
            "cedula": employee['cedula'],
            "departamento":employee['departamento'],
            "cargo": employee['cargo']

        })
    return jsonify(result)

# Ruta para agregar un empleado (POST)
@app.route('/api/employees', methods=['POST'])
def create_employee():
    data = request.get_json()

    # Verificación de campos requeridos
    if 'name' not in data or 'cedula' not in data or 'departamento' not in data:
        return jsonify({'message': 'Name, Cedula and Departamento are required'}), 400

    # Verificar si el departamento existe
    if not check_department(data['departamento']):
        return jsonify({'message': 'El departamento no existe'}), 400

    # Crear un nuevo empleado si el departamento es válido
    new_employee = {
        "name": data['name'],
        "lastname": data['lastname'],
        "cedula": data['cedula'],
        "departamento": data['departamento'],
        "cargo": data['cargo']
    }

    # Insertar en la base de datos
    employee_collection.insert_one(new_employee)
    department_collection.update_one(
        {"name": data['departamento']},
        {"$addToSet": {"members": data['cedula']}}
    )
    return jsonify({"message": "Empleado creado con éxito"}), 201
    
    

@app.route('/api/employees/<cedula>',methods = ['GET'])
def buscar_cedula(cedula):
    employee = employee_collection.find_one({"cedula": cedula})
    if employee:
        return jsonify({
            "name": employee["name"],
            "lastname": employee["lastname"],
            "cedula": employee["cedula"],
            "departamento": employee["departamento"],
            "cargo": employee["cargo"]
        }), 200
    else:
        return jsonify({"message": "Empleado no encontrado"}), 404

#actualizar los datos con la cedula de parametro

@app.route('/api/employees/<cedula>', methods=['PUT'])
def actualizar_empleado(cedula):
    data = request.get_json()

    # Verificar si el departamento existe
    if not check_department(data.get("departamento", "")):
        return jsonify({"message": "El departamento no existe."}), 400

    # Actualizar el empleado
    updated_data = {k: v for k, v in data.items() if v is not None}
    
    # No actualizamos la cédula, ya que no debe cambiar
    updated_data.pop('cedula', None)
    
    result = employee_collection.update_one(
        {"cedula": cedula},
        {"$set": updated_data}
    )

    if result.modified_count > 0:
        return jsonify({"message": "Empleado actualizado exitosamente."}), 200
    else:
        return jsonify({"message": "No se realizaron cambios."}), 200

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
        # Obtener todos los departamentos de la colección
        departments = department_collection.find()  # Accede a la colección "departments"
        
        # Verifica que haya departamentos en la base de datos
        if departments:
            result = []
            for department in departments:
                result.append({
                    "id": str(department["_id"]),
                    "name": department["name"],
                    "description": department.get("description", ""),
                    "members": department.get("members", [])  # Si quieres agregar la lista de miembros
                })
            return jsonify(result)  # Responde con el JSON de los departamentos
        else:
            return jsonify([])  # Si no hay departamentos, respondemos con una lista vacía

    except Exception as e:
        print(f"Error al obtener departamentos: {e}")
        return jsonify({"error": "No se pudo obtener la lista de departamentos"}), 500


@app.route('/api/employees/<string:employee_cedula>', methods=['PUT'])
def edit_employee(employee_cedula):
    data = request.get_json()

    # Verificar campos requeridos
    if 'name' not in data or 'cedula' not in data or 'departamento' not in data:
        return jsonify({'message': 'Name, Cedula and Departamento are required'}), 400

    # Verificar si el nuevo departamento existe
    new_department = check_department(data['departamento'])
    if not new_department:
        return jsonify({'message': 'El departamento no existe'}), 400

    # Buscar el empleado en la base de datos
    employee = employee_collection.find_one({"cedula": employee_cedula})
    if not employee:
        return jsonify({'message': 'Empleado no encontrado'}), 404

    # Obtener el departamento actual del empleado
    old_department = employee['departamento']

    # Si el departamento ha cambiado, eliminar la cédula de la lista del antiguo departamento
    if old_department != data['departamento']:
        department_collection.update_one(
            {"name": old_department},
            {"$pull": {"members": data['cedula']}}  # Eliminar la cédula del antiguo departamento
        )

    # Actualizar los datos del empleado
    updated_employee = {
        "name": data['name'],
        "lastname": data['lastname'],
        "cedula": data['cedula'],
        "departamento": data['departamento'],
        "cargo": data['cargo']
    }

    # Actualizar el empleado en la base de datos
    employee_collection.update_one(
        {"cedula": employee_cedula},
        {"$set": updated_employee}
    )

    # Agregar la cédula al nuevo departamento
    department_collection.update_one(
        {"name": data['departamento']},
        {"$addToSet": {"members": data['cedula']}}  # Agregar la cédula al nuevo departamento
    )

    return jsonify({"message": "Empleado actualizado con éxito"}), 200



if __name__ == '__main__':
    app.run(debug=True)

