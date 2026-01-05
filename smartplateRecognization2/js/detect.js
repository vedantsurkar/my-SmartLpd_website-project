// DOM Elements
const fileInput = document.getElementById('fileInput');
const fileInputBtn = document.getElementById('fileInputBtn');
const cameraBtn = document.getElementById('cameraBtn');
const resetBtn = document.getElementById('resetBtn');
const detectBtn = document.getElementById('detectBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const issueFineBtn = document.getElementById('issueFineBtn');
const preview = document.getElementById('preview');
const dropZone = document.getElementById('dropZone');
const platePreview = document.getElementById('platePreview');
const extractedText = document.getElementById('extractedText');

// Authentication check
if (!localStorage.getItem('authToken')) {
    alert('Please login first to use license plate detection.');
    window.location.href = 'login.html';
}

// Update navigation to show user is logged in
const authButtons = document.querySelector('.auth-buttons');
if (authButtons && localStorage.getItem('authToken')) {
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    authButtons.innerHTML = `
        <div class="user-info">
            <span>Welcome, ${username} (${userRole})</span>
            <button class="btn btn-outline" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;

    // Show authority link if user is authority
    if (userRole === 'AUTHORITY') {
        document.getElementById('authorityLink').style.display = 'block';
    }
}

// Logout function for detection page
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

// Camera Elements
const cameraControls = document.getElementById('cameraControls');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCanvas = document.getElementById('cameraCanvas');
const captureBtn = document.getElementById('captureBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');

// Backend Configuration
const BACKEND_URL = 'http://localhost:8080';
const DETECT_ENDPOINT = '/api/detect';

// Global variables
let cameraStream = null;
let currentImageData = null;
let detectedLicensePlate = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Hide camera controls by default
    cameraControls.style.display = 'none';
    
    // Set up event listeners
    setupEventListeners();
    
    // Check backend connection
    checkBackendConnection();
});

function setupEventListeners() {
    // File input listeners
    fileInputBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // Camera listeners
    cameraBtn.addEventListener('click', openCamera);
    
    // Reset and clear listeners
    resetBtn.addEventListener('click', resetPreview);
    clearBtn.addEventListener('click', resetPreview);
    
    // Detection listeners
    detectBtn.addEventListener('click', detectLicensePlate);
    copyBtn.addEventListener('click', copyText);
    downloadBtn.addEventListener('click', downloadResult);
    issueFineBtn.addEventListener('click', redirectToIssueFine);

    // Camera event listeners
    captureBtn.addEventListener('click', captureImage);
    closeCameraBtn.addEventListener('click', closeCamera);

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        if (e.dataTransfer.files.length) {
            handleFileSelect({ target: { files: e.dataTransfer.files } });
        }
    });
}

// Check backend connection
async function checkBackendConnection() {
    try {
        const response = await fetch(BACKEND_URL + '/api/test');
        if (response.ok) {
            console.log('✅ Backend connected successfully');
        } else {
            console.warn('⚠️ Backend responded with error');
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
        showStatus('Backend connection failed. Make sure Spring Boot is running on port 8080.', 'error');
    }
}

// File Handling
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Close any active camera
    closeCamera();
    
    // Only accept image files
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, WEBP)');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImageData = e.target.result;
        preview.innerHTML = `<img src="${currentImageData}" alt="Preview">`;
        showStatus('Image loaded successfully! Ready for detection.', 'success');
    };
    reader.readAsDataURL(file);
}

// Camera Functions
function openCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment' // Use back camera by default
            } 
        })
        .then(stream => {
            cameraStream = stream;
            cameraVideo.srcObject = stream;
            
            // Show camera controls and hide regular preview
            preview.style.display = 'none';
            cameraControls.style.display = 'block';
        })
        .catch(err => {
            console.error('Camera error:', err);
            alert('Unable to access camera: ' + err.message);
        });
    } else {
        alert('Camera not supported on this device');
    }
}

function captureImage() {
    const context = cameraCanvas.getContext('2d');
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
    
    // Convert canvas to data URL and set as preview image
    currentImageData = cameraCanvas.toDataURL('image/png');
    preview.innerHTML = `<img src="${currentImageData}" alt="Captured Image">`;
    
    // Close camera and show preview
    closeCamera();
    preview.style.display = 'flex';
    showStatus('Image captured successfully! Ready for detection.', 'success');
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraControls.style.display = 'none';
    preview.style.display = 'flex';
}

// Reset and Clear Functions
function resetPreview() {
    // Close any active camera
    closeCamera();
    
    // Reset preview
    preview.innerHTML = '<p>No preview available</p>';
    preview.style.display = 'flex';
    platePreview.textContent = 'LICENSE PLATE';
    extractedText.textContent = 'No results yet. Upload an image and click "Detect Plate".';
    currentImageData = null;
    detectedLicensePlate = null;
    issueFineBtn.style.display = 'none';
    
    // Clear file input
    fileInput.value = '';
}

// REAL Detection Function - Connects to Spring Boot Backend
async function detectLicensePlate() {
    // Check if there's an image to process
    if (!currentImageData) {
        alert('Please upload or capture an image first!');
        return;
    }
    
    // Get auth token
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Please login first to use license plate detection.');
        window.location.href = 'login.html';
        return;
    }
    
    // Show loading state
    detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    detectBtn.disabled = true;
    
    try {
        // Convert image to base64 (remove data URL prefix)
        const base64Image = currentImageData.split(',')[1];
        
        // Send to Spring Boot backend with Authorization header
        const response = await fetch(BACKEND_URL + DETECT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({
                imageData: base64Image
            })
        });

        // Handle unauthorized response
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
            alert('Session expired. Please login again.');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Update UI with real results from backend
        if (result.success) {
            detectedLicensePlate = result.licensePlateNumber;
            platePreview.textContent = detectedLicensePlate;
            extractedText.textContent = detectedLicensePlate;
            showStatus(`✅ License plate detected: ${detectedLicensePlate} (${Math.round(result.confidence * 100)}% confidence)`, 'success');
            
            // Show issue fine button for authorities
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'AUTHORITY') {
                issueFineBtn.style.display = 'block';
            }
        } else {
            platePreview.textContent = 'NOT FOUND';
            extractedText.textContent = 'No license plate detected';
            showStatus(`❌ ${result.message}`, 'error');
            issueFineBtn.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Detection error:', error);
        showStatus('Error detecting license plate: ' + error.message, 'error');
        
        // Fallback to mock data if backend fails
        fallbackToMockDetection();
    } finally {
        // Reset button state
        detectBtn.innerHTML = '<i class="fas fa-search"></i> Detect Plate';
        detectBtn.disabled = false;
    }
}

// Fallback to mock detection if backend fails
function fallbackToMockDetection() {
    const mockPlates = ['ABC123', 'XYZ789', 'DEF456', 'GHI789', 'JKL012'];
    const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)];
    const confidence = (0.85 + Math.random() * 0.15).toFixed(2);
    
    detectedLicensePlate = randomPlate;
    platePreview.textContent = randomPlate;
    extractedText.textContent = randomPlate;
    showStatus(`⚠️ Using mock data: ${randomPlate} (${Math.round(confidence * 100)}% confidence)`, 'info');
    
    // Show issue fine button for authorities
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'AUTHORITY') {
        issueFineBtn.style.display = 'block';
    }
}

// Utility Functions
function copyText() {
    const text = extractedText.textContent;
    if (text && text !== 'No results yet. Upload an image and click "Detect Plate".') {
        navigator.clipboard.writeText(text).then(() => {
            showStatus('Text copied to clipboard!', 'success');
        });
    } else {
        showStatus('No text to copy!', 'error');
    }
}

function downloadResult() {
    const text = extractedText.textContent;
    if (text && text !== 'No results yet. Upload an image and click "Detect Plate".') {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', 'license_plate_result.txt');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showStatus('Result downloaded successfully!', 'success');
    } else {
        showStatus('No results to download!', 'error');
    }
}

function redirectToIssueFine() {
    if (detectedLicensePlate) {
        // Store the detected plate for the manage fines page
        localStorage.setItem('detectedPlate', detectedLicensePlate);
        window.location.href = 'manage-fines.html';
    } else {
        showStatus('No license plate detected to issue fine!', 'error');
    }
}

function showStatus(message, type = 'info') {
    // Remove existing status messages
    const existingStatus = document.querySelector('.status-message');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Create new status message
    const statusDiv = document.createElement('div');
    statusDiv.className = `status-message status-${type}`;
    statusDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    statusDiv.style.backgroundColor = colors[type] || colors.info;
    
    statusDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(statusDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (statusDiv.parentNode) {
            statusDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => statusDiv.remove(), 300);
        }
    }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);