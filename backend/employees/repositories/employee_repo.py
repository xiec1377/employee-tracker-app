from django.db.models.sql import Query
from ..models import Employee
from django.db.models.query import QuerySet
from django.conf import settings

# from typing import Dict, List


class EmployeeRepository:
    @staticmethod
    def get_employee_by_id(employee_id):
        """
        Get employee by id from database.
        """
        try:
            return Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return None

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

    @staticmethod
    def delete_employee(employee):
        """
        Deletes employee from database.
        """
        employee.delete()

    @staticmethod
    def save_employee(employee):
        employee.save()
        return employee
