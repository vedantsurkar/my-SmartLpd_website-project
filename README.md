SmartLPD - License Plate Detection System
This is a complete license plate detection and fine management system created as part of my learning.

Technologies Used
Backend: Java Spring Boot
Frontend: HTML, CSS, JavaScript
ML Service: Python Flask with OpenCV
Database: MySQL
Authentication: JWT with Spring Security

Project Structure
backend/ – Spring Boot REST API
frontend/ – Web interface with HTML/CSS/JS
ml-service/ – License plate detection using Python
application.properties – Database and configuration

How to Run

Prerequisites:
1.Install Java 17+
2.Install MySQL and create smartlpd database
3.Install Python 3.8+ and Tesseract OCR
4.Install Maven for Java build

Steps:
1.Start MySQL database
Run Backend (Spring Boot):
   cd backend
   mvn spring-boot:run

2.Run ML Service:
   cd ml-service
   python app.py

3.Open Frontend:
   Open frontend/index.html in any browser
   Or use live server: npx live-server frontend   


Test Credentials:
Citizen: testuser / password123
Authority: testauthority / password123

Access the application at: http://localhost:5500 (frontend) with backend running on port 8080 and ML service on port 5000.
   
