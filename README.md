# 🏛️ CivicAlert – Local Complaint Management System

A full-stack real-time complaint management system built with **Django REST Framework** (backend) and **React** (frontend).

---

## 📁 Project Structure

```
complaint-system/
├── backend/                          # Django REST Framework
│   ├── complaint_system/
│   │   ├── __init__.py
│   │   ├── settings.py               # Main settings (env-driven)
│   │   ├── urls.py                   # Root URL config
│   │   └── wsgi.py
│   ├── complaints/
│   │   ├── __init__.py
│   │   ├── admin.py                  # Admin panel config
│   │   ├── apps.py
│   │   ├── models.py                 # Complaint model
│   │   ├── serializers.py            # DRF serializers
│   │   ├── views.py                  # API views
│   │   └── urls.py                   # API URL routes
│   ├── media/                        # Uploaded complaint images
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile                      # Render deployment
│   ├── runtime.txt                   # Python version for Render
│   └── .env.example
│
└── frontend/                         # React application
    ├── public/
    │   └── index.html                # Tailwind CDN + custom styles
    ├── src/
    │   ├── api/
    │   │   ├── axios.js              # Axios instance + JWT interceptor
    │   │   └── services.js           # All API call functions
    │   ├── components/
    │   │   ├── ComplaintCard.js      # Single complaint display card
    │   │   ├── ComplaintForm.js      # New complaint form + image upload
    │   │   ├── Navbar.js             # Top navigation bar
    │   │   ├── PrivateRoute.js       # Auth-protected route wrapper
    │   │   └── StatusBadge.js        # Color-coded status indicator
    │   ├── context/
    │   │   └── AuthContext.js        # Global auth state (React Context)
    │   ├── pages/
    │   │   ├── Dashboard.js          # Main dashboard with filters
    │   │   ├── LoginPage.js          # Login form
    │   │   └── RegisterPage.js       # Registration form
    │   ├── App.js                    # Router + route definitions
    │   └── index.js                  # React entry point
    ├── package.json
    └── .env.example
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | None | Register new user |
| POST | `/api/auth/login/` | None | Login, receive JWT tokens |
| POST | `/api/auth/logout/` | JWT | Logout (blacklist token) |
| POST | `/api/auth/token/refresh/` | Refresh token | Get new access token |
| GET | `/api/auth/profile/` | JWT | Get current user info |
| GET | `/api/complaints/` | JWT | List complaints (user or all) |
| POST | `/api/complaints/` | JWT | Create complaint (multipart) |
| GET | `/api/complaints/<id>/` | JWT | Get complaint details |
| PATCH | `/api/complaints/<id>/status/` | JWT (Admin) | Update complaint status |

---

## ⚙️ Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or use SQLite for local dev)
- Git

---

### Backend Setup

```bash
# 1. Navigate to backend directory
cd complaint-system/backend

# 2. Create and activate virtual environment
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create your .env file from the example
cp .env.example .env
```

Edit `.env` with your values:
```env
SECRET_KEY=your-very-secret-key-change-this
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3    # SQLite for local dev
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

```bash
# 5. Run database migrations
python manage.py migrate

# 6. Create an admin user (to test admin features)
python manage.py createsuperuser

# 7. Start the Django development server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**
Admin panel at: **http://localhost:8000/admin**

---

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd complaint-system/frontend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
```

Edit `.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

```bash
# 4. Start the React development server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🧪 Testing the API

### Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"securepass123","password2":"securepass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"securepass123"}'
```

**Create a complaint (with image):**
```bash
curl -X POST http://localhost:8000/api/complaints/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=Broken streetlight" \
  -F "description=The streetlight at corner has been broken for 3 days" \
  -F "location=123 Main St" \
  -F "image=@/path/to/photo.jpg"
```

**Get all complaints:**
```bash
curl http://localhost:8000/api/complaints/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update complaint status (admin only):**
```bash
curl -X PATCH http://localhost:8000/api/complaints/1/status/ \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"In Progress"}'
```

---

### Using the Admin Panel

1. Go to `http://localhost:8000/admin`
2. Login with your superuser credentials
3. You can view, edit, and manage all complaints from here
4. Change `is_staff = True` on any user to make them an admin in the React app

---

## 🚀 Deployment Guide

### Step 1: Deploy Backend to Render

1. **Push your backend to GitHub** (in a repository or subfolder)

2. **Create a PostgreSQL database on Render:**
   - Go to [render.com](https://render.com) → New → PostgreSQL
   - Name it `civic-alert-db`
   - Copy the **Internal Database URL** (for use within Render) or the **External URL**

3. **Create a Web Service on Render:**
   - New → Web Service → Connect your GitHub repo
   - Set the **Root Directory** to `backend` (if in a monorepo)
   - Runtime: **Python 3**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn complaint_system.wsgi:application --bind 0.0.0.0:$PORT`

4. **Add Environment Variables** in Render dashboard:
   ```
   SECRET_KEY          = <generate a random 50-char string>
   DEBUG               = False
   DATABASE_URL        = <paste the PostgreSQL Internal URL from step 2>
   ALLOWED_HOSTS       = your-app-name.onrender.com
   CORS_ALLOWED_ORIGINS = https://your-vercel-app.vercel.app
   ```

5. **Run migrations after first deploy:**
   - In Render → Shell tab:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. Your backend API is live at: `https://your-app-name.onrender.com`

---

### Step 2: Deploy Frontend to Vercel

1. **Push your frontend to GitHub**

2. **Import project to Vercel:**
   - Go to [vercel.com](https://vercel.com) → New Project
   - Import your GitHub repository
   - Set **Root Directory** to `frontend` (if in a monorepo)
   - Framework Preset: **Create React App**

3. **Add Environment Variable** in Vercel:
   ```
   REACT_APP_API_URL = https://your-app-name.onrender.com/api
   ```

4. **Deploy** — Vercel will build and deploy automatically.

5. Your frontend is live at: `https://your-app.vercel.app`

---

### Step 3: Serving Media Files in Production

By default, Render's filesystem is ephemeral (uploaded images won't persist between deploys).  
For production image storage, use **Cloudinary** or **AWS S3**:

```bash
pip install django-cloudinary-storage cloudinary
```

Add to `settings.py`:
```python
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    config('CLOUDINARY_API_KEY'),
    'API_SECRET': config('CLOUDINARY_API_SECRET'),
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
```

---

## 🔐 Making a User an Admin

After creating the first superuser (`createsuperuser`), any user can be promoted to admin via the Django Admin panel:

1. Go to `/admin` → Users → Select the user
2. Check **Staff status** → Save

This user will now see all complaints and have the status update dropdown in the frontend.

---

## 💡 Key Design Decisions

| Decision | Reason |
|----------|--------|
| JWT over Session auth | Stateless, works great for React SPAs and mobile apps |
| Token stored in localStorage | Simple; for higher security use httpOnly cookies |
| `multipart/form-data` for image upload | Required by Django for `ImageField` |
| Admin check via `is_staff` | Reuses Django's built-in permission system |
| WhiteNoise for static files | No extra server config needed on Render |
| `dj-database-url` | Parses `DATABASE_URL` env var (standard on Render/Heroku) |

---

## 🛡️ Security Checklist for Production

- [ ] `DEBUG = False`
- [ ] `SECRET_KEY` is a long random string, stored in env var
- [ ] `ALLOWED_HOSTS` is set to your Render domain only
- [ ] `CORS_ALLOWED_ORIGINS` is set to your Vercel domain only
- [ ] Passwords are hashed (Django does this automatically via `create_user()`)
- [ ] JWT access tokens expire in 1 hour (configurable in `SIMPLE_JWT`)
- [ ] Admin panel is accessible only to `is_staff` users
- [ ] File uploads are validated by `Pillow` (`ImageField`)
