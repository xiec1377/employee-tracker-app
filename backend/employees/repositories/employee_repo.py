from ..models import Employee
from typing import Dict


class EmployeeRepository:
    @staticmethod
    def create_employee(employee_data: Dict) -> Employee:
        """
        Creates a new Employee in the database.
        """
        print("creating employee in repo layer...", employee_data)
        employee = Employee.objects.create(**employee_data)
        return employee

    @staticmethod
    def get_employee_by_email(email: str) -> Employee | None:
        try:
            return Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            return None
