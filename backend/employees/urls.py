# # employees/urls.py
# from django.urls import path
# from .views import create_employee

# urlpatterns = [
#     path("add/", create_employee, name="create_employee"),
# ]


from django.urls import path
from .views import create_employee, delete_employee, get_all_employees

urlpatterns = [
    path("", create_employee, name="create-employee"),  # POST /api/employees/
    path(
        "all/", get_all_employees, name="get-all-employees"
    ),  # GET /api/employees/all/
    path("<int:id>/", delete_employee, name="delete_employee"),
]
