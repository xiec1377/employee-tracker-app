# # employees/urls.py
# from django.urls import path
# from .views import create_employee

# urlpatterns = [
#     path("add/", create_employee, name="create_employee"),
# ]


from django.urls import path
from .views import (
    create_employee,
    delete_employee,
    get_all_employees,
    update_employee,
    import_employees,
    export_employees,
)

urlpatterns = [
    path("", get_all_employees, name="get-all-employees"),  # GET /api/employees/
    path(
        "create/", create_employee, name="create-employee"
    ),  # POST /api/employees/create
    path(
        "<int:id>/", delete_employee, name="delete-employee"
    ),  # DELETE /api/employees/<id>/
    # Update an employee
    path(
        "<int:id>/edit/", update_employee, name="update-employee"
    ),  # PUT /api/employees/<id>/edit/
    path("import/", import_employees, name="import-employees"),
    path("export/", export_employees, name="export-employees"),
]
