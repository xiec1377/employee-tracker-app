# from rest_framework import viewsets, status
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from django.db.models import Q
# from .models import Employee
# from .serializers import EmployeeSerializer


# class EmployeeViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet for Employee CRUD operations.

#     list: Get all employees (supports search and filtering)
#     retrieve: Get a single employee by ID
#     create: Create a new employee
#     update: Update an employee (full update)
#     partial_update: Update an employee (partial update)
#     destroy: Delete an employee
#     """

#     queryset = Employee.objects.all()
#     serializer_class = EmployeeSerializer
#     permission_classes = [AllowAny]  # Change to IsAuthenticated in production

#     def get_queryset(self):
#         """Filter and search employees based on query parameters."""
#         queryset = Employee.objects.all()

#         # Search parameter
#         search = self.request.query_params.get("search", None)
#         if search:
#             queryset = queryset.filter(
#                 Q(first_name__icontains=search)
#                 | Q(last_name__icontains=search)
#                 | Q(email__icontains=search)
#                 | Q(phone__icontains=search)
#                 | Q(department__icontains=search)
#                 | Q(position__icontains=search)
#             )

#         # Department filter
#         department = self.request.query_params.get("department", None)
#         if department and department != "all":
#             queryset = queryset.filter(department=department)

#         # Status filter
#         status_filter = self.request.query_params.get("status", None)
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)

#         return queryset.order_by("-created_at")

#     def create(self, request, *args, **kwargs):
#         """Create a new employee."""
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response(
#             serializer.data, status=status.HTTP_201_CREATED, headers=headers
#         )

#     @action(detail=False, methods=["get"])
#     def departments(self, request):
#         """Get list of unique departments."""
#         departments = (
#             Employee.objects.values_list("department", flat=True)
#             .distinct()
#             .order_by("department")
#         )
#         return Response(list(departments))
