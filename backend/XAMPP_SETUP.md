# XAMPP + Backend Setup Guide

Complete step-by-step guide for setting up the Toxic Society backend with XAMPP for local development.

## Prerequisites

- Windows 10/11, macOS, or Linux
- Python 3.11+ installed
- XAMPP installed from [apachefriends.org](https://www.apachefriends.org/)

---

## Step 1: Install XAMPP

1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Run the installer
3. Choose components (Apache + MySQL are required for this project)
4. Install to default location (recommended)
5. Launch XAMPP Control Panel after installation

---

## Step 2: Start XAMPP MySQL Service

1. Open **XAMPP Control Panel**
2. Find the **MySQL** row
3. Click **"Start"** button next to MySQL
4. You should see **"MySQL started [PID: xxxx]"**

Default MySQL credentials:

- **Host**: localhost
- **User**: root
- **Password**: (empty - no password)
- **Port**: 3306

---

## Step 3: Create Database

### Option A: Using phpMyAdmin (Easy - GUI)

1. Open browser: `http://localhost/phpmyadmin`
2. Click **"New"** on the left sidebar
3. Enter database name: `toxic_society`
4. Collation: `utf8mb4_unicode_ci` (recommended)
5. Click **"Create"**

### Option B: Using Command Line (Advanced)

```bash
# Open command prompt/terminal
mysql -u root

# Then type:
CREATE DATABASE toxic_society;
EXIT;
```

---

## Step 4: Setup Python Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## Step 5: Configure Backend Environment

```bash
# Create .env file from example
cp .env.example .env

# Edit .env with your favorite text editor
# (Open backend/.env file)
```

Edit `.env` to have at least:

```env
# MySQL Connection (XAMPP default)
DATABASE_URL=mysql+pymysql://root:@localhost:3306/toxic_society

# Secret key for JWT
SECRET_KEY=your-super-secret-key-change-this

# Rest of the keys (you can skip these for now, leave as placeholder)
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
PAYSTACK_SECRET_KEY=sk_test_placeholder
PAYSTACK_PUBLIC_KEY=pk_test_placeholder
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Step 6: Create Database Tables

```bash
# Make sure you're in the backend folder
# Make sure virtual environment is activated (you should see (venv) in terminal)

# Run Alembic migrations
alembic upgrade head
```

You should see output like:

```
INFO [alembic.runtime.migration] Context impl MySQLImpl with target metadata
INFO [alembic.runtime.migration] Will assume non-transactional DDL
INFO [alembic.runtime.migration] Running upgrade 001_initial
INFO [alembic.runtime.migration] Done.
```

---

## Step 7: Start Backend Server

```bash
# Make sure virtual environment is activated
# Make sure you're in backend folder

# Start server with auto-reload (recommended for development)
uvicorn main:app --reload

# Or without reload:
uvicorn main:app --host 0.0.0.0 --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## Step 8: Access Backend

Open your browser and visit:

- **API Docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

---

## Complete Local Development Stack

Once everything is set up:

### Terminal 1 - Backend API

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
# Running on http://localhost:8000
```

### Terminal 2 - Frontend

```bash
npm run dev
# Running on http://localhost:5173
```

Both should now communicate with each other!

---

## Common Issues & Fixes

### Issue: "MySQL not starting"

**Solution:**

- Make sure XAMPP is run as Administrator
- Check if port 3306 is already in use
- Restart your computer and try again

### Issue: "Can't connect to MySQL"

**Solution:**

```bash
# Check if MySQL is running
mysql -u root -h localhost

# If that fails, MySQL isn't running - start it in XAMPP Control Panel
```

### Issue: "ModuleNotFoundError: No module named 'pymysql'"

**Solution:**

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall requirements
pip install -r requirements.txt
```

### Issue: "DATABASE_URL not set"

**Solution:**

```bash
# Make sure .env file exists in backend folder
# Make sure DATABASE_URL is in .env:
DATABASE_URL=mysql+pymysql://root:@localhost:3306/toxic_society
```

### Issue: "XAMPP won't start MySQL on Mac"

**Solution:**

```bash
# Try starting from command line instead
sudo /Applications/XAMPP/xamppfiles/bin/mysql.server start
```

---

## Next: Deploy to cPanel

When you're ready for production, follow the **cPanel Migration** section in the main README.md

---

## Database Management

### Access Database via phpMyAdmin

1. Go to: http://localhost/phpmyadmin
2. Username: `root`
3. Password: (leave empty)
4. Click "Go"

You can now:

- View all tables
- Add/edit/delete data
- Create backups
- Import/export

### Access via Command Line

```bash
mysql -u root

# Select database
USE toxic_society;

# List tables
SHOW TABLES;

# View specific table
SELECT * FROM users;

# Exit
EXIT;
```

---

## Troubleshooting Database

### Check MySQL port

```bash
# Windows
netstat -ano | findstr :3306

# macOS/Linux
lsof -i :3306
```

### Restart MySQL

```bash
# Stop MySQL (via XAMPP Control Panel)
# Then click "Start" again
```

### Reset MySQL

```bash
# Via XAMPP:
1. Click "Config" next to MySQL
2. Select "my.ini"
3. Look for port and other settings
```

---

## Performance Tips

- Use MySQL port 3306 (default)
- Close unnecessary applications to free up RAM
- Keep XAMPP updated
- Use SSD for better database performance

---

## Security Notes (Development Only)

⚠️ **IMPORTANT**: XAMPP defaults are NOT secure for production!

For development only:

- Root user has no password
- Access restricted to localhost
- No SSL/TLS encryption

**For Production (cPanel)**:

- Create dedicated database user with strong password
- Use SSL connections
- Enable firewall rules
- Never expose MySQL port to public internet

---

## Backup Your Database

```bash
# Backup to file
mysqldump -u root toxic_society > backup.sql

# Later, restore from backup
mysql -u root toxic_society < backup.sql

# Or use phpMyAdmin export/import feature
```

---

## Next Steps

1. ✅ XAMPP MySQL running
2. ✅ Backend API running on http://localhost:8000
3. ✅ Frontend running on http://localhost:5173
4. 📝 Start building features!
5. 🚀 Deploy to cPanel when ready

---

**Need help?** Check the main README.md for more detailed information.
