# # employees/urls.py
# from django.urls import path
# from .views import create_employee

# urlpatterns = [
#     path("add/", create_employee, name="create_employee"),
# ]


from django.urls import path
from .views import create_employee, delete_employee, get_all_employees, update_employee

urlpatterns = [
    path("", create_employee, name="create-employee"),  # POST /api/employees/
    # Get all employees
    path(
        "all/", get_all_employees, name="get-all-employees"
    ),  # GET /api/employees/all/
    # Delete an employee
    path(
        "<int:id>/", delete_employee, name="delete-employee"
    ),  # DELETE /api/employees/<id>/
    # Update an employee
    path(
        "<int:id>/edit/", update_employee, name="update-employee"
    ),  # PUT /api/employees/<id>/edit/
]
