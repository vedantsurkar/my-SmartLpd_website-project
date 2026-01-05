# SmartLPD - Smart License Plate Detection System

This is a complete web application for license plate detection and traffic fine management, built as a learning project.

## 📁 Project Structure

```
smartlpd/
├── backend/           # Spring Boot REST API (Java)
├── frontend/          # Web Interface (HTML/CSS/JavaScript)
└── ml-service/        # License Plate Detection (Python)
```

## 🛠️ Technologies Used

### Backend (Java)
- Spring Boot
- Spring Security with JWT
- Spring Data JPA
- MySQL Database

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome Icons

### ML Service (Python)
- Flask
- OpenCV
- Tesseract OCR
- NumPy

## 🚀 How to Run

### Step 1: Setup Database
1. Install MySQL
2. Create database:
   ```sql
   CREATE DATABASE smartlpd;
   ```

### Step 2: Configure Backend
1. Navigate to backend folder:
   ```bash
   cd backend
   ```
2. Update `src/main/resources/application.properties` with your MySQL credentials
3. Build and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

### Step 3: Setup ML Service
1. Install Python dependencies:
   ```bash
   cd ml-service
   pip install -r requirements.txt
   ```
2. Install Tesseract OCR:
   - Windows: `choco install tesseract`
   - Ubuntu: `sudo apt install tesseract-ocr`
3. Run ML service:
   ```bash
   python app.py
   ```

### Step 4: Launch Frontend
1. Open the frontend folder
2. Open `index.html` in your web browser
3. Or use live server:
   ```bash
   npx live-server frontend
   ```

## 🔗 Access Points

- **Frontend**: `http://localhost:5500` (or file:// path)
- **Backend API**: `http://localhost:8080`
- **ML Service**: `http://localhost:5000`

## 👥 User Roles

### 👤 Citizen
- Register and login
- Check fines by license plate
- Pay outstanding fines
- View payment history

### 👮 Government Authority
- Register with @gov.ac.in email only
- Login with username/email
- Access license plate detection
- Issue and manage fines
- View system statistics

## 📞 Test Users

### For Quick Testing:

#### Citizen Account:
- **Username**: `testuser`
- **Password**: `password123`
- **Create URL**: `http://localhost:8080/api/auth/create-test-user`

#### Authority Account:
- **Username**: `testauthority`
- **Password**: `password123`
- **Create URL**: `http://localhost:8080/api/auth/create-test-authority`

## 🐛 Troubleshooting

### Common Issues:

1. **MySQL Connection Error**
   - Ensure MySQL service is running
   - Verify database credentials in `application.properties`
   - Check if database `smartlpd` exists

2. **Tesseract OCR Not Found**
   - Install Tesseract on your system
   - Update path in `ml-service/app.py` if needed

3. **CORS Errors in Browser**
   - Ensure all services are running
   - Check browser console for specific errors
   - Verify backend CORS configuration

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token in Authorization header
   - Verify user role permissions

## 📊 Features

- ✅ User registration and login
- ✅ Role-based access control
- ✅ License plate detection from images
- ✅ Camera capture support
- ✅ Fine management system
- ✅ Online payment simulation
- ✅ Responsive web design
- ✅ Real-time status updates

## 📱 Pages

1. **Home** (`index.html`) - Landing page
2. **Login** (`login.html`) - User authentication
3. **Signup** (`signup.html`) - Account creation
4. **Detection** (`detect.html`) - License plate detection (Authority only)
5. **Check Fines** (`check-fine.html`) - Citizen fine portal
6. **Manage Fines** (`manage-fines.html`) - Authority management panel

## 🔧 Configuration Files

### Important Files:
- `backend/src/main/resources/application.properties` - Spring Boot configuration
- `frontend/js/auth.js` - Authentication logic
- `ml-service/app.py` - ML service configuration

## 📝 Notes

- This is a learning project, not production-ready
- Use strong passwords for production
- Implement HTTPS for security
- Add input validation and sanitization
- Consider using environment variables for secrets

## 📄 License

Educational Use Only

---

*Created as part of a web development learning journey*
