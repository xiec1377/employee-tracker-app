from rest_framework import serializers
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model with camelCase field names for frontend compatibility."""

    # Map Django snake_case fields to camelCase for frontend
    firstName = serializers.CharField(
        source="first_name", max_length=100, write_only=False
    )
    lastName = serializers.CharField(
        source="last_name", max_length=100, write_only=False
    )
    hireDate = serializers.DateField(
        source="hire_date",
        write_only=False,
        required=False,
        allow_null=True,
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "department",
            "position",
            "hireDate",
            "salary",
            "status",
            "createdAt",
            "updatedAt",
        ]
        extra_kwargs = {
            # "email": {"required": False, "allow_null": True, "allow_blank": True},
            "phone": {"required": False, "allow_null": True, "allow_blank": True},
            "hireDate": {"required": False, "allow_null": True, "allow_blank": True},
            "salary": {"required": False, "allow_null": True},
            # "status": {"required": False},
        }

    def validate_email(self, value):
        """Validate email if provided."""
        # During create, check if email exists (excluding current instance during update)
        if value:
            instance = getattr(self, "instance", None)
            if instance:
                # Update: check if email exists for other employees
                if (
                    Employee.objects.filter(email=value)
                    .exclude(pk=instance.pk)
                    .exists()
                ):
                    raise serializers.ValidationError(
                        "An employee with this email already exists."
                    )
            else:
                # Create: check if email exists
                if Employee.objects.filter(email=value).exists():
                    raise serializers.ValidationError(
                        "An employee with this email already exists."
                    )
        return value

    def validate_status(self, value):
        """Validate status is a valid choice."""
        if value:
            valid_statuses = [choice[0] for choice in Employee.Status.choices]
            if value not in valid_statuses:
                raise serializers.ValidationError(
                    f"Status must be one of: {', '.join(valid_statuses)}"
                )
        return value

    def validate_salary(self, value):
        """Validate salary is a valid choice."""
        if value is not None and value < 0:
            raise serializers.ValidationError("Salary cannot be negative.")
        return value
