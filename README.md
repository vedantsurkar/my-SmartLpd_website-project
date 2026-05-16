# SmartLPD - Smart License Plate Detection System

SmartLPD is a full-stack web application for **license plate detection** and **traffic fine management**.  
It is built as a learning project to demonstrate backend development, role-based authentication, OCR-based plate detection, and fine management workflows.

---

## 🌐 Live Demo

**Live Project Demo:**  
https://smartlpd-frontend.netlify.app/

---

## 📌 Project Overview

SmartLPD allows government authorities to detect vehicle license plates from images and issue traffic fines. Citizens can check and pay their fines using their vehicle license plate number.

The system provides separate workflows for **Citizens** and **Government Authorities**.

---

## 📁 Project Structure

```bash
smartlpd/
├── backend/           # Spring Boot REST API
├── frontend/          # Web Interface
└── ml-service/        # License Plate Detection Service
```

---

## 🛠️ Technologies Used

### Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- MySQL

### Frontend

- HTML5
- CSS3
- JavaScript
- Font Awesome Icons

### ML Service

- Python
- Flask
- OpenCV
- Tesseract OCR
- NumPy

---

## ✨ Features

- User registration and login
- JWT-based authentication
- Role-based access control
- Citizen and Authority dashboards
- License plate detection from uploaded images
- Camera capture support
- Fine creation and management
- Fine checking using license plate number
- Online payment simulation
- Payment history tracking
- Responsive web design
- Real-time status updates

---

## 👥 User Roles

### Citizen

Citizens can:

- Register and login
- Check fines using their vehicle license plate number
- View outstanding fines
- Pay fines through payment simulation
- View payment history

### Government Authority

Government authorities can:

- Register using authorized email
- Login securely
- Upload vehicle images for license plate detection
- Detect license plate numbers
- Issue traffic fines
- Manage existing fines
- View system statistics

---

## 🚀 How to Run Locally

> Note: The live demo is available above. The following setup steps are only required if you want to run the project locally.

### Step 1: Clone the Repository

```bash
git clone <your-repository-link>
cd smartlpd
```

---

### Step 2: Setup MySQL Database

Install MySQL and create a database:

```sql
CREATE DATABASE smartlpd;
```

---

### Step 3: Configure Backend

Navigate to the backend folder:

```bash
cd backend
```

Update the database configuration in:

```bash
src/main/resources/application.properties
```

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartlpd
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Build and run the backend:

```bash
mvn clean install
mvn spring-boot:run
```

Backend will run on:

```bash
http://localhost:8080
```

---

### Step 4: Setup ML Service

Navigate to the ML service folder:

```bash
cd ml-service
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Install Tesseract OCR:

#### Windows

```bash
choco install tesseract
```

#### Ubuntu/Linux

```bash
sudo apt install tesseract-ocr
```

Run the ML service:

```bash
python app.py
```

ML service will run on:

```bash
http://localhost:5000
```

---

### Step 5: Run Frontend

Navigate to the frontend folder:

```bash
cd frontend
```

Open the following file in your browser:

```bash
index.html
```

Or run using Live Server:

```bash
npx live-server frontend
```

Frontend will run on:

```bash
http://localhost:5500
```

---

## 🔗 Access Points

| Service | URL |
|---|---|
| Live Demo | https://smartlpd-frontend.netlify.app/ |
| Frontend Local | http://localhost:5500 |
| Backend API | http://localhost:8080 |
| ML Service | http://localhost:5000 |

---

## 📱 Application Pages

| Page | Description |
|---|---|
| `index.html` | Landing page |
| `login.html` | User login |
| `signup.html` | User registration |
| `detect.html` | License plate detection page |
| `check-fine.html` | Citizen fine checking portal |
| `manage-fines.html` | Authority fine management dashboard |

---

## 📞 Test Users

### Citizen Account

```bash
Username: testuser
Password: password123
```

Create test citizen user:

```bash
http://localhost:8080/api/auth/create-test-user
```

### Authority Account

```bash
Username: testauthority
Password: password123
```

Create test authority user:

```bash
http://localhost:8080/api/auth/create-test-authority
```

---

## 🔧 Important Configuration Files

| File | Purpose |
|---|---|
| `backend/src/main/resources/application.properties` | Backend and database configuration |
| `frontend/js/auth.js` | Frontend authentication logic |
| `ml-service/app.py` | ML service and OCR configuration |

---

## 🐛 Troubleshooting

### MySQL Connection Error

- Make sure MySQL service is running
- Check database name, username, and password
- Verify that the `smartlpd` database exists
- Check the database URL in `application.properties`

### Tesseract OCR Not Found

- Install Tesseract OCR properly
- Add Tesseract to system PATH
- Update the Tesseract path in `ml-service/app.py` if required

### CORS Error

- Make sure backend and ML service are running
- Check backend CORS configuration
- Verify the API URLs used in frontend JavaScript files

### Authentication Issue

- Clear browser localStorage
- Login again to generate a fresh JWT token
- Check whether the correct role is being used
- Verify Authorization headers in API requests

---

## 📊 Future Improvements

- Add real payment gateway integration
- Improve OCR accuracy using advanced deep learning models
- Add email or SMS notifications for fines
- Add admin dashboard with analytics
- Deploy backend and ML service on cloud
- Add HTTPS support
- Store secrets using environment variables
- Improve input validation and sanitization
- Add unit and integration testing

---

## 📝 Notes

- This project is created for educational and learning purposes
- It is not intended for real-world traffic enforcement without further improvements
- Security, validation, and deployment configurations should be improved before production use

---

## 📄 License

This project is for educational use only.

---

## 👨‍💻 Author

**Vedant Surkar**

Created as part of a full-stack web development and backend learning journey.
