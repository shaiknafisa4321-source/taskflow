# TaskFlow — Task Management Application

A web-based task management application built with **Python, Flask, MySQL, HTML, CSS, and JavaScript**. TaskFlow helps users organize their work, manage tasks, track progress, and stay productive through a simple and user-friendly interface.

## Features

- **User Authentication:** Register and log in to a personal account.
- **Task Creation:** Create tasks with titles, descriptions, priorities, due dates, and statuses.
- **View Tasks:** Display saved tasks on the dashboard.
- **Update Tasks:** Edit existing task details and update their status.
- **Delete Tasks:** Remove tasks when they are no longer needed.
- **Search Tasks:** Find tasks using the search feature.
- **Status Filtering:** Filter tasks by status, such as Pending, In Progress, and Completed.
- **User-Specific Access:** Users can access and manage their own tasks.
- **Database Persistence:** Store user accounts and tasks in a MySQL database.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Application logic |
| Flask | Backend web framework |
| Flask-SQLAlchemy | Database ORM |
| MySQL | Database management |
| PyMySQL | MySQL database connectivity |
| HTML | Web page structure |
| CSS | Styling and layout |
| JavaScript | Frontend interactions |
| python-dotenv | Environment variable management |

## Project Structure

```text
TaskFlow/
├── app.py
├── config.py
├── models.py
├── requirements.txt
├── .gitignore
├── templates/
│   ├── login.html
│   ├── register.html
│   └── index.html
└── static/
    ├── style.css
    └── script.js


## Prerequisites

Before running TaskFlow, install:

- Python 3.10 or a compatible version
- MySQL Server
- Git
- A web browser

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/shaiknafisa4321/TaskFlow.git
cd TaskFlow
```


### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can run the virtual environment's Python directly using `.\venv\Scripts\python.exe`.

### 3. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Configure MySQL

Start your MySQL server and create the database:

```sql
CREATE DATABASE taskflow_db;
```

Configure your database connection using the environment variables expected by your `config.py`.

For example, if your configuration uses these variable names, create a `.env` file in the project root:

```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_NAME=taskflow_db
```

Replace the example password with your own MySQL password.

### 5. Run the application

```bash
python app.py
```

Open your browser and visit:

- Application: http://127.0.0.1:5000/
- Login: http://127.0.0.1:5000/login
- Registration: http://127.0.0.1:5000/register

Keep the terminal running while using the application.

## How to Use

1. Register a new account.
2. Log in with your credentials.
3. Create a task by entering its details.
4. View your saved tasks on the dashboard.
5. Search for tasks or filter them by status.
6. Edit task details or update task progress.
7. Delete tasks when they are no longer required.
8. Log out when finished.

## Security Notes

- Store passwords securely using password hashing.
- Keep database credentials and secret keys in environment variables.
- Ensure that every task operation checks the authenticated user's identity and task ownership.
- Do not commit `.env`, virtual environment files, or sensitive information to GitHub.
- Use a strong, private secret key in your local environment.

## Future Improvements

- Add task reminders and notifications.
- Add pagination for large task lists.
- Improve mobile responsiveness.
- Add task sorting by due date and priority.
- Deploy the application to a hosting platform.

## Project Information

**Project Name:** TaskFlow — Task Management Application  
**Category:** Full Stack Web Development  


## Author

**Nafisa Shaik**

GitHub: https://github.com/shaiknafisa4321

---

*TaskFlow is a learning project developed to practice full-stack web development, REST API integration, database operations, and user authentication.*
