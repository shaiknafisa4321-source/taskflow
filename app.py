from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify, render_template, redirect, session, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import db, User, Task
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
VALID_STATUSES = {"Pending", "In Progress", "Completed"}
VALID_PRIORITIES = {"Low", "Medium", "High"}
def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if "user_id" not in session:
            if request.path.startswith("/api/"):
                return jsonify({"error": "Please log in first"}), 401
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return wrapped_view
def task_to_dict(task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description or "",
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else "",
        "created_at": task.created_at.isoformat() if task.created_at else ""
    }
@app.route("/")
@login_required
def home():
    return render_template("index.html")
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        if not username or not email or not password:
            return render_template(
                "register.html",
                error="Please fill in all the fields."
            )
        if len(password) < 8:
            return render_template(
                "register.html",
                error="Password must contain at least 8 characters."
            )
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return render_template(
                "register.html",
                error="An account with this email already exists."
            )
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        session.clear()
        session["user_id"] = user.id
        return redirect(url_for("home"))
    return render_template("register.html")
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password_hash, password):
            session.clear()
            session["user_id"] = user.id
            return redirect(url_for("home"))
        return render_template(
            "login.html",
            error="Invalid email or password."
        )
    return render_template("login.html")
@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("login"))
@app.route("/api/me")
@login_required
def current_user():
    user = db.session.get(User, session["user_id"])
    if user is None:
        session.clear()
        return jsonify({"error": "Please log in again"}), 401
    return jsonify({"username": user.username})
@app.route("/api/tasks", methods=["GET"])
@login_required
def tasks():
    user_id = session["user_id"]
    if request.method == "GET":
        user_tasks = Task.query.filter_by(user_id=user_id).order_by(
            Task.id.desc()
        ).all()
        return jsonify([task_to_dict(task) for task in user_tasks])
    data = request.get_json(silent=True) or {}
    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    status = data.get("status", "Pending")
    priority = data.get("priority", "Medium")
    due_date = data.get("due_date") or None
    if not title:
        return jsonify({"error": "Task title is required."}), 400
    if len(title) > 150:
        return jsonify({"error": "Title must be 150 characters or less."}), 400
    if status not in VALID_STATUSES:
        return jsonify({"error": "Invalid task status."}), 400
    if priority not in VALID_PRIORITIES:
        return jsonify({"error": "Invalid task priority."}), 400
    try:
        parsed_due_date = (
            datetime.strptime(due_date, "%Y-%m-%d").date()
            if due_date else None
        )
    except ValueError:
        return jsonify({"error": "Enter a valid due date."}), 400
    task = Task(
        title=title,
        description=description,
        status=status,
        priority=priority,
        due_date=parsed_due_date,
        user_id=user_id
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task_to_dict(task)), 201
@app.route("/api/tasks/<int:task_id>", methods=["PATCH", "DELETE"])
@login_required
def task_detail(task_id):
    task = Task.query.filter_by(
        id=task_id,
        user_id=session["user_id"]
    ).first()
    if task is None:
        return jsonify({"error": "Task not found."}), 404
    if request.method == "DELETE":
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully."})
    data = request.get_json(silent=True) or {}
    if "title" in data:
        title = str(data["title"]).strip()
        if not title or len(title) > 150:
            return jsonify({"error": "Enter a valid task title."}), 400
        task.title = title
    if "description" in data:
        task.description = str(data["description"]).strip()
    if "status" in data:
        if data["status"] not in VALID_STATUSES:
            return jsonify({"error": "Invalid task status."}), 400
        task.status = data["status"]
    if "priority" in data:
        if data["priority"] not in VALID_PRIORITIES:
            return jsonify({"error": "Invalid task priority."}), 400
        task.priority = data["priority"]
    if "due_date" in data:
        try:
            task.due_date = (
                datetime.strptime(data["due_date"], "%Y-%m-%d").date()
                if data["due_date"] else None
            )
        except (ValueError, TypeError):
            return jsonify({"error": "Enter a valid due date."}), 400
    db.session.commit()
    return jsonify(task_to_dict(task))
@app.errorhandler(500)
def server_error(error):
    db.session.rollback()
    return jsonify({"error": "Something went wrong on the server."}), 500
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)