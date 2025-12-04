from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services.employee_service import EmployeeService


@api_view(["GET"])
def get_all_employees(request):
    print("employees")
    try:
        employees = EmployeeService.get_employees()
        print("employees:", employees)
        return Response(employees, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def create_employee(request):
    print("here...")
    print("employee", request.data)
    try:
        employee = EmployeeService.create_employee(request.data)
        return Response(
            {
                "id": employee.id,
                "first_name": employee.first_name,
                "last_name": employee.last_name,
                "email": employee.email,
                "department": employee.department,
                "position": employee.position,
                "hire_date": employee.hire_date,
                "salary": employee.salary,
                "status": employee.status,
            },
            status=status.HTTP_201_CREATED,
        )
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def delete_employee(request, id):
    print(f"delete employee {id}")
    try:
        EmployeeService.delete_employee(id)
        return Response(
            {"message": f"Employee {id} deleted successfully"},
            status=status.HTTP_200_OK,
        )
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": "Internal server error"}, status=500)
