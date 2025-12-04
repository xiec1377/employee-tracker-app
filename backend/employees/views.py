from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services.employee_service import EmployeeService
from .serializers import EmployeeSerializer


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
    print("employee", request.data)
    try:
        employee = EmployeeService.create_employee(request.data)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data, status=201)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
def update_employee(request, id):
    print(f"Updating employee {id}")
    try:
        updated_employee = EmployeeService.update_employee(id, request.data)
        serializer = EmployeeSerializer(updated_employee)

        return Response(
            {
                "message": f"Employee {id} updated successfully",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(str(e))
        return Response({"error": "Internal server error"}, status=500)


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
