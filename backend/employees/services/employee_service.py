from ..repositories.employee_repo import EmployeeRepository
from ..models import Employee


class EmployeeService:
    @staticmethod
    def create_employee(data: dict) -> Employee:
        """
        Business logic for adding an employee.
        For example, check if email already exists.
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
