from ..repositories.employee_repo import EmployeeRepository
from ..models import Employee
from bson.decimal128 import Decimal128


class EmployeeService:
    @staticmethod
    def create_employee(data: dict) -> Employee:
        """
        Business logic for adding an employee.
        """
        print("we in services", data)
        mapping = {
            "firstName": "first_name",
            "lastName": "last_name",
            "department": "department",
            "position": "position",
            # "hireDate": "hire_date",
            "status": "status",
            "email": "email",
            "phone": "phone",
            "salary": "salary",
        }
        model_data = {mapping[k]: v for k, v in data.items() if k in mapping}
        existing_employee = EmployeeRepository.get_employee_by_email(
            model_data.get("email")
        )
        if existing_employee:
            raise ValueError("Employee with this email already exists.")

        employee = EmployeeRepository.create_employee(model_data)
        return employee

    @staticmethod
    def get_employees() -> list[dict]:
        """
        Business logic for listing all existing employees.
        """
        employees = EmployeeRepository.get_all_employees()
        employee_list = []
        for employee in employees:
            salary = None
            if employee.salary is not None:
                if isinstance(employee.salary, Decimal128):
                    salary = float(employee.salary.to_decimal())
                else:
                    salary = float(employee.salary)
            employee_list.append(
                {
                    "id": employee.id,
                    "firstName": employee.first_name,
                    "lastName": employee.last_name,
                    "email": employee.email,
                    "phone": employee.phone,
                    "department": employee.department,
                    "position": employee.position,
                    # "hire_date": employee.hire_date.isoformat(),
                    "salary": salary,
                    "status": employee.status,
                }
            )

        return employee_list
