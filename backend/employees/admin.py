# from django.contrib import admin
# from .models import Employee


# @admin.register(Employee)
# class EmployeeAdmin(admin.ModelAdmin):
#     """Admin configuration for Employee model."""

#     list_display = (
#         "full_name",
#         "email",
#         "department",
#         "position",
#         "hire_date",
#         "status",
#         "created_at",
#     )
#     list_filter = (
#         "status",
#         "department",
#         "hire_date",
#     )
#     search_fields = (
#         "first_name",
#         "last_name",
#         "email",
#         "department",
#         "position",
#     )
#     readonly_fields = ("created_at", "updated_at")
#     ordering = ("-created_at",)

#     fieldsets = (
#         (
#             "Personal Information",
#             {"fields": ("first_name", "last_name", "email", "phone")},
#         ),
#         (
#             "Employment Details",
#             {"fields": ("department", "position", "hire_date", "salary", "status")},
#         ),
#         (
#             "Timestamps",
#             {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
#         ),
#     )

#     def full_name(self, obj):
#         return obj.full_name

#     full_name.short_description = "Full Name"
