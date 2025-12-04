# # employees/urls.py
# from django.urls import path
# from .views import create_employee

# urlpatterns = [
#     path("add/", create_employee, name="create_employee"),
# ]


from django.urls import path
from .views import create_employee

urlpatterns = [
    path("", create_employee, name="create-employee"),  # maps POST /api/employees/
]
