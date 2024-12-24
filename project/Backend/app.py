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
    
    if 'name' not in data or 'cedula' not in data:
        return jsonify({'message': 'Name and Cedula are required'}), 400

    existing_employee = employee_collection.find_one({'cedula': data['cedula']})
    if existing_employee:
        return jsonify({'message': 'La cédula ya está registrada'}), 400

    # Crear un nuevo empleado
    new_employee = {
        "name": data['name'],
        "lastname" : data['lastname'],
        "cedula": data['cedula'],
        "departamento": data['dept'],
        "cargo": data['cargo']


    }
    
    # Insertar el nuevo empleado en la colección "employee"
    employee_collection.insert_one(new_employee)
    
    return jsonify({"message": "Empleado creado con exito"}), 201

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
    employee = employee_collection.find_one({"cedula": cedula})
    if employee:
        # Obtener los datos que se deben actualizar
        updated_data = request.get_json()

        # Actualizar los datos en la base de datos
        result = employee_collection.update_one(
            {"cedula": cedula},
            {"$set": updated_data}
        )

        if result.modified_count > 0:
            return jsonify({"message": "Empleado actualizado exitosamente."}), 200
        else:
            return jsonify({"message": "No se realizaron cambios."}), 200
    else:
        return jsonify({"message": "Empleado no encontrado."}), 404


if __name__ == '__main__':
    app.run(debug=True)
