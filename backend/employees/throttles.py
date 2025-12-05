from rest_framework.throttling import UserRateThrottle


class GetEmployeesThrottle(UserRateThrottle):
    rate = "20/min"


class CreateEmployeeThrottle(UserRateThrottle):
    rate = "10/min"


class UpdateEmployeeThrottle(UserRateThrottle):
    rate = "10/min"


class DeleteEmployeeThrottle(UserRateThrottle):
    rate = "10/min"


class ImportEmployeesThrottle(UserRateThrottle):
    rate = "3/min"


class ExportEmployeesThrottle(UserRateThrottle):
    rate = "5/min"
