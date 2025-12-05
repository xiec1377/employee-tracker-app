from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, throttle_classes
from rest_framework.parsers import MultiPartParser
from .services.employee_service import EmployeeService
from .serializers import EmployeeSerializer
from django.http import HttpResponse
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from .throttles import (
    GetEmployeesThrottle,
    CreateEmployeeThrottle,
    UpdateEmployeeThrottle,
    DeleteEmployeeThrottle,
    ImportEmployeesThrottle,
    ExportEmployeesThrottle,
)
from .pagination import EmployeePagination
from .models import Employee


@api_view(["GET"])
@throttle_classes([GetEmployeesThrottle, AnonRateThrottle])
# def get_all_employees(request):
#     print("employees")
#     try:
#         employees = EmployeeService.get_employees()
#         print("employees:", employees)
#         return Response(employees, status=status.HTTP_200_OK)
#     except ValueError as e:
#         return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


def get_all_employees(request):
    print("getting all employees----")
    try:
        # employees = EmployeeService.get_employees()  # QuerySet
        employees = Employee.objects.all()
        paginator = EmployeePagination()
        page = paginator.paginate_queryset(employees, request)

        serializer = EmployeeSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@throttle_classes([CreateEmployeeThrottle, AnonRateThrottle])
def create_employee(request):
    print("employee", request.data)
    try:
        employee = EmployeeService.create_employee(request.data)
        serializer = EmployeeSerializer(employee)
        return Response(serializer.data, status=201)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@throttle_classes([UpdateEmployeeThrottle, AnonRateThrottle])
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
@throttle_classes([DeleteEmployeeThrottle, AnonRateThrottle])
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


@api_view(["POST"])
@parser_classes([MultiPartParser])
@throttle_classes([ImportEmployeesThrottle, AnonRateThrottle])
def import_employees(request):
    try:
        excel_file = request.FILES["file"]
        result = EmployeeService.import_from_excel(excel_file)
        return Response(result, status=200)
    except KeyError:
        return Response({"error": "File not provided"}, status=400)


@api_view(["GET"])
@throttle_classes([ExportEmployeesThrottle, AnonRateThrottle])
def export_employees(request):
    response: HttpResponse = EmployeeService.export_to_excel()
    return response
