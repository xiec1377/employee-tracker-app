from django.db import models
from django.core.validators import EmailValidator, MinValueValidator


class Employee(models.Model):
    """
    Employee model representing an employee in the system.
    Matches the frontend Employee interface structure.
    """

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        ON_LEAVE = "on_leave", "On Leave"

    first_name = models.CharField(max_length=100, verbose_name="First Name")
    last_name = models.CharField(max_length=100, verbose_name="Last Name")
    email = models.EmailField(
        max_length=255,
        unique=True,
        blank=True,
        null=True,
        validators=[EmailValidator()],
        verbose_name="Email Address",
        help_text="Employee email address (optional)",
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="Phone Number",
        help_text="Contact phone number",
    )
    department = models.CharField(
        max_length=100, verbose_name="Department", help_text="Employee department"
    )
    position = models.CharField(
        max_length=100, verbose_name="Position", help_text="Job title/position"
    )
    hire_date = models.DateField(
        verbose_name="Hire Date",
        help_text="Date when employee was hired",
        null=True,
        blank=True,
    )
    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        verbose_name="Salary",
        help_text="Annual salary (optional)",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name="Status",
        help_text="Current employment status",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["department"]),
            models.Index(fields=["status"]),
            models.Index(fields=["last_name", "first_name"]),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
