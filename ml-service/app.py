from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import pytesseract
import re
import time
import base64
from PIL import Image
import io
import numpy as np
import traceback

app = Flask(__name__)
CORS(app)

# Set Tesseract path for Windows
try:
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    print(f"✅ Tesseract path set to: {pytesseract.pytesseract.tesseract_cmd}")
except Exception as e:
    print(f"❌ Tesseract path error: {e}")
    print("🔍 Trying to find Tesseract in PATH...")
    pytesseract.pytesseract.tesseract_cmd = 'tesseract'

def preprocess_image(image_np):
    """Enhanced image preprocessing for better OCR"""
    try:
        # Convert to grayscale
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_np
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Multiple preprocessing techniques
        # 1. Adaptive threshold
        thresh_adaptive = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                              cv2.THRESH_BINARY, 11, 2)
        
        # 2. Otsu's threshold
        _, thresh_otsu = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return gray, thresh_adaptive, thresh_otsu
    except Exception as e:
        print(f"❌ Preprocessing error: {e}")
        return image_np, image_np, image_np

def detect_license_plate_contours(image_np):
    """Detect license plate using contour analysis"""
    try:
        gray, _, thresh_otsu = preprocess_image(image_np)
        
        # Find contours
        contours, _ = cv2.findContours(thresh_otsu, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:15]
        
        for contour in contours:
            perimeter = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * perimeter, True)
            
            # Look for rectangular contours
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                
                # Typical license plate aspect ratios
                if 1.5 <= aspect_ratio <= 4.0 and w > 50 and h > 20:
                    license_plate = gray[y:y+h, x:x+w]
                    return license_plate, (x, y, w, h)
        
        return None, None
    except Exception as e:
        print(f"❌ Contour detection error: {e}")
        return None, None

def extract_text_with_ocr(image_region, config='--psm 8'):
    """Extract text from image region using Tesseract"""
    try:
        if image_region is None or image_region.size == 0:
            return ""
            
        if len(image_region.shape) == 3:
            image_region = cv2.cvtColor(image_region, cv2.COLOR_BGR2GRAY)
        
        # Enhance image for better OCR
        # Resize if too small
        height, width = image_region.shape
        if width < 100:
            scale_factor = 200 / width
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            image_region = cv2.resize(image_region, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
        
        # Apply thresholding
        _, binary_image = cv2.threshold(image_region, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # OCR configuration for license plates
        custom_config = f'{config} -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        
        text = pytesseract.image_to_string(binary_image, config=custom_config)
        return text.strip()
    except Exception as e:
        print(f"❌ OCR Error: {e}")
        return ""

def validate_license_plate(text):
    """Validate if extracted text looks like a license plate"""
    if not text:
        return None, 0.0
    
    # Clean text - remove special characters, keep only letters and numbers
    cleaned = re.sub(r'[^A-Z0-9]', '', text.upper())
    
    # Basic validation rules
    if len(cleaned) < 4 or len(cleaned) > 10:
        return None, 0.0
    
    # Check for mixed letters and numbers (typical for license plates)
    has_letters = any(c.isalpha() for c in cleaned)
    has_digits = any(c.isdigit() for c in cleaned)
    
    if not (has_letters and has_digits):
        return None, 0.0
    
    # Confidence calculation based on various factors
    base_confidence = 0.5
    length_bonus = min(len(cleaned) * 0.05, 0.3)  # Longer text = more confidence
    mixed_bonus = 0.2 if (has_letters and has_digits) else 0.0
    
    confidence = base_confidence + length_bonus + mixed_bonus
    confidence = min(confidence, 0.95)  # Cap at 95%
    
    return cleaned, confidence

def detect_license_plate_real(image_data):
    """REAL license plate detection - NO MOCK DATA"""
    try:
        start_time = time.time()
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        print("🔍 Starting REAL license plate detection...")
        print(f"📏 Image size: {image_np.shape[1]}x{image_np.shape[0]}")
        
        # Method 1: Contour-based detection (most accurate)
        plate_region, bbox = detect_license_plate_contours(image_np)
        
        if plate_region is not None:
            print("✅ License plate region found using contours")
            text = extract_text_with_ocr(plate_region, '--psm 8')
            license_plate, confidence = validate_license_plate(text)
            
            if license_plate:
                processing_time = time.time() - start_time
                print(f"✅ REAL Detection Successful: {license_plate} (confidence: {confidence:.2f})")
                return {
                    "license_plate": license_plate,
                    "confidence": round(confidence, 2),
                    "success": True,
                    "method": "contour_detection",
                    "processing_time": round(processing_time, 2)
                }
        
        # Method 2: Full image OCR (fallback)
        print("🔄 Trying full image OCR...")
        gray, _, _ = preprocess_image(image_np)
        full_text = extract_text_with_ocr(gray, '--psm 6')
        license_plate, confidence = validate_license_plate(full_text)
        
        if license_plate:
            processing_time = time.time() - start_time
            print(f"✅ REAL Detection Successful: {license_plate} (confidence: {confidence:.2f})")
            return {
                "license_plate": license_plate,
                "confidence": round(confidence * 0.8, 2),  # Lower confidence for full image
                "success": True,
                "method": "full_image_ocr",
                "processing_time": round(processing_time, 2)
            }
        
        # Method 3: Try different OCR configurations
        print("🔄 Trying alternative OCR configurations...")
        for psm in [7, 10, 11, 13]:
            alt_text = extract_text_with_ocr(gray, f'--psm {psm}')
            license_plate, confidence = validate_license_plate(alt_text)
            if license_plate:
                processing_time = time.time() - start_time
                print(f"✅ REAL Detection Successful: {license_plate} (confidence: {confidence:.2f})")
                return {
                    "license_plate": license_plate,
                    "confidence": round(confidence * 0.7, 2),
                    "success": True,
                    "method": f"alt_psm_{psm}",
                    "processing_time": round(processing_time, 2)
                }
        
        # NO LICENSE PLATE DETECTED - Return failure instead of mock data
        processing_time = time.time() - start_time
        print("❌ No license plate detected - REAL RESULT")
        return {
            "license_plate": "NOT_DETECTED",
            "confidence": 0.0,
            "success": False,
            "method": "real_detection_failed",
            "error": "No license plate could be detected in the image",
            "processing_time": round(processing_time, 2)
        }
        
    except Exception as e:
        processing_time = time.time() - start_time
        print(f"❌ REAL Detection Error: {e}")
        
        # RETURN ACTUAL ERROR INSTEAD OF MOCK DATA
        return {
            "license_plate": "DETECTION_ERROR",
            "confidence": 0.0,
            "success": False,
            "method": "processing_error",
            "error": f"Detection failed: {str(e)}",
            "processing_time": round(processing_time, 2)
        }

@app.route('/detect', methods=['POST'])
def detect_plate():
    try:
        data = request.get_json()
        image_data = data.get('imageData')
        
        if not image_data:
            return jsonify({"error": "No image data provided"}), 400
        
        print("📨 Received REAL detection request")
        
        # Use REAL detection function (no mock data)
        result = detect_license_plate_real(image_data)
        print(f"📝 REAL Result: {result}")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ API Error: {e}")
        return jsonify({
            "license_plate": "API_ERROR",
            "confidence": 0.0,
            "success": False,
            "error": str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Test Tesseract installation
        test_text = pytesseract.image_to_string(np.ones((50, 200), dtype=np.uint8) * 255)
        tesseract_status = "working"
    except Exception as e:
        tesseract_status = f"error: {str(e)}"
    
    return jsonify({
        "status": "REAL ML Service Running", 
        "engine": "Tesseract OCR - REAL DETECTION ONLY",
        "tesseract_status": tesseract_status,
        "version": "Real License Plate Detection v3.0",
        "mock_data": "DISABLED - Only real detection"
    })

@app.route('/test', methods=['GET'])
def test_route():
    """Simple test endpoint"""
    return jsonify({
        "message": "REAL ML Service is working - No mock data!",
        "timestamp": time.time(),
        "detection_type": "REAL_TIME_ONLY"
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 REAL LICENSE PLATE DETECTION SERVICE")
    print("📝 Tesseract Version: REAL DETECTION ONLY")
    print("❌ MOCK DATA: DISABLED")
    print("✅ REAL DETECTION: ENABLED")
    print("💡 Features: Contour detection, multi-PSM, image preprocessing")
    print("=" * 60)
    
    # Test Tesseract
    try:
        pytesseract.get_tesseract_version()
        print("✅ Tesseract OCR initialized successfully")
    except Exception as e:
        print(f"❌ Tesseract initialization failed: {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
