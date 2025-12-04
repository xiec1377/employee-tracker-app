from ..models import Employee

# from typing import Dict, List


class EmployeeRepository:
    @staticmethod
    def create_employee(employee_data: dict) -> Employee:
        """
        Creates a new Employee in the database.
        """
        print("creating employee in repo layer...", employee_data)
        employee = Employee.objects.create(**employee_data)
        return employee

    @staticmethod
    def get_employee_by_email(email: str) -> Employee | None:
        """
        Returns Employee records with email.
        """
        try:
            return Employee.objects.get(email=email)
        except Employee.DoesNotExist:
            return None

    @staticmethod
    def get_all_employees() -> list[Employee]:
        """
        Returns all Employee records from the database.
        """
        return list(Employee.objects.all())
