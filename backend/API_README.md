# Django Employee API

This document describes the Django REST Framework API for managing employees.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Base URL
```
http://localhost:8000/api/
```

### Employee Endpoints

#### List All Employees
```http
GET /api/employees/
```

**Query Parameters:**
- `search` - Search in name, email, phone, department, position
- `department` - Filter by department
- `status` - Filter by status (active, inactive, on_leave)

**Example:**
```bash
GET /api/employees/?search=john&department=Engineering
```

#### Get Single Employee
```http
GET /api/employees/{id}/
```

#### Create Employee
```http
POST /api/employees/
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1 (555) 123-4567",
  "department": "Engineering",
  "position": "Senior Software Engineer",
  "hireDate": "2022-01-15",
  "salary": 120000,
  "status": "active"
}
```

#### Update Employee (Full)
```http
PUT /api/employees/{id}/
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  ...
}
```

#### Update Employee (Partial)
```http
PATCH /api/employees/{id}/
Content-Type: application/json

{
  "salary": 130000
}
```

#### Delete Employee
```http
DELETE /api/employees/{id}/
```

#### Get Departments List
```http
GET /api/employees/departments/
```

Returns a list of unique department names.

## Request/Response Format

### Field Names
The API uses **camelCase** field names to match the frontend:

- `firstName` (maps to `first_name` in database)
- `lastName` (maps to `last_name`)
- `hireDate` (maps to `hire_date`)
- `createdAt` (maps to `created_at`)
- `updatedAt` (maps to `updated_at`)

### Employee Object Structure

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+1 (555) 123-4567",
  "department": "Engineering",
  "position": "Senior Software Engineer",
  "hireDate": "2022-01-15",
  "salary": 120000.00,
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Field Validation

- **firstName** - Required, max 100 characters
- **lastName** - Required, max 100 characters
- **email** - Optional, must be valid email format, unique if provided
- **phone** - Optional, max 20 characters
- **department** - Required, max 100 characters
- **position** - Required, max 100 characters
- **hireDate** - Required, ISO date format (YYYY-MM-DD)
- **salary** - Optional, must be >= 0, decimal with 2 places
- **status** - Optional, must be one of: `active`, `inactive`, `on_leave` (default: `active`)

## Error Responses

### Validation Error (400)
```json
{
  "firstName": ["This field is required."],
  "email": ["An employee with this email already exists."]
}
```

### Not Found (404)
```json
{
  "detail": "Not found."
}
```

## CORS Configuration

The API is configured to allow requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

To modify allowed origins, update `CORS_ALLOWED_ORIGINS` in `backend/settings.py`.

## Example Usage

### Using curl

```bash
# Create an employee
curl -X POST http://localhost:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "department": "Marketing",
    "position": "Marketing Manager",
    "hireDate": "2021-06-10",
    "salary": 95000,
    "status": "active"
  }'

# Get all employees
curl http://localhost:8000/api/employees/

# Search employees
curl "http://localhost:8000/api/employees/?search=jane"

# Update an employee
curl -X PATCH http://localhost:8000/api/employees/1/ \
  -H "Content-Type: application/json" \
  -d '{"salary": 100000}'

# Delete an employee
curl -X DELETE http://localhost:8000/api/employees/1/
```

### Using Python requests

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Create employee
response = requests.post(
    f"{BASE_URL}/employees/",
    json={
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "department": "Engineering",
        "position": "Developer",
        "hireDate": "2024-01-15",
        "salary": 120000,
        "status": "active"
    }
)
print(response.json())

# Get all employees
response = requests.get(f"{BASE_URL}/employees/")
employees = response.json()
print(employees)

# Search employees
response = requests.get(f"{BASE_URL}/employees/?search=john")
print(response.json())
```

## Integration with Frontend

The frontend API utilities in `frontend/lib/api/employees.ts` are already configured to work with these endpoints. Just make sure:

1. The Django server is running on `http://localhost:8000`
2. Set the environment variable `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in your frontend `.env.local` file

Then update your frontend components to use the API functions instead of mock data.

## Next Steps

1. **Authentication**: Add authentication/authorization (currently using `AllowAny`)
2. **Pagination**: Adjust pagination settings if needed (currently 100 items per page)
3. **Filtering**: Add more filtering options if needed
4. **Validation**: Add custom business logic validation
5. **Testing**: Add API tests in `api/tests.py`

