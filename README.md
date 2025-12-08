# employee-tracker-app

Live [here](https://employee-tracker-app-one.vercel.app/)!

Tech stack: 
- Frontend: Next.js (deployed on [Vercel](https://employee-tracker-app-one.vercel.app/))
- Backend: Python (deployed on [Render](https://employee-tracker-app-75l7.onrender.com/api/employees/))
- Database: MongoDB (having dependency issues connecting Django ORM to MongoDB NoSQL, so using SQLite for now)

Frontend features:
- sort columns in asc and dec order
- filtering 
- undo deletion 
- bar and pie graph using mock data 
- autocomplete search bar that searches first name, last name, department, position, email
- excel import and export (see `frontend/public/examples` to see `sample_input_file.xlsx` and `sample_output_file.xlsx`)

Backend/architecture features:
- layered architecture (routes -> services -> repositories)
- schema validation (via serializers and validators in the view layer)
- rate limiting middleware and throttles

- pagination with page size 10

<img width="1880" height="892" alt="image" src="https://github.com/user-attachments/assets/b1dcbfd5-8d4b-4c71-833e-9babb60f292c" />

