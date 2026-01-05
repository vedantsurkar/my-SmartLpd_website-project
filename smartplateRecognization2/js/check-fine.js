const BACKEND_URL = 'http://localhost:8080';

// Check authentication and role
document.addEventListener('DOMContentLoaded', function() {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!authToken) {
        alert('Please login first to check fines.');
        window.location.href = 'login.html';
        return;
    }

    updateNavigation();
    debugAuth();
    
    // Show authority link if user is authority
    if (userRole === 'AUTHORITY') {
        const authorityLink = document.getElementById('authorityLink');
        if (authorityLink) {
            authorityLink.style.display = 'block';
        }
    }

    document.getElementById('checkFineBtn').addEventListener('click', checkFines);
    
    // Add enter key support
    const licensePlateInput = document.getElementById('licensePlate');
    if (licensePlateInput) {
        licensePlateInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkFines();
            }
        });
    }
});

function debugAuth() {
    console.log('🔍 Check Fines Debug Info:');
    console.log('Token:', localStorage.getItem('authToken'));
    console.log('Username:', localStorage.getItem('username'));
    console.log('Role:', localStorage.getItem('userRole'));
}

function updateNavigation() {
    const authButtons = document.getElementById('authButtons');
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    if (authToken && authButtons) {
        authButtons.innerHTML = `
            <div class="user-info">
                <span>Welcome, ${username} (${userRole})</span>
                <button class="btn btn-outline" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `;
    }
}

async function checkFines() {
    const licensePlateInput = document.getElementById('licensePlate');
    if (!licensePlateInput) {
        showStatus('License plate input not found', 'error');
        return;
    }

    const licensePlate = licensePlateInput.value.trim().toUpperCase();
    
    if (!licensePlate) {
        showStatus('Please enter a license plate number', 'error');
        return;
    }

    // Basic license plate validation
    if (licensePlate.length < 3 || licensePlate.length > 15) {
        showStatus('Please enter a valid license plate number (3-15 characters)', 'error');
        return;
    }

    const checkBtn = document.getElementById('checkFineBtn');
    const originalText = checkBtn.innerHTML;
    checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
    checkBtn.disabled = true;

    try {
        console.log('🔍 Checking fines for:', licensePlate);
        
        const response = await fetch(`${BACKEND_URL}/api/fines/check?licensePlateNumber=${encodeURIComponent(licensePlate)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 500) {
                const errorData = await response.json();
                throw new Error(`Server error: ${errorData.message || 'Internal server error'}`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Fines check result:', result);

        if (result.success) {
            displayFines(result.fines, licensePlate);
            showStatus('Fines retrieved successfully', 'success');
        } else {
            showStatus('Error: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error checking fines:', error);
        showStatus('Failed to check fines: ' + error.message, 'error');
    } finally {
        checkBtn.innerHTML = '<i class="fas fa-search"></i> Check Fines';
        checkBtn.disabled = false;
    }
}

function displayFines(fines, licensePlate) {
    const resultsSection = document.getElementById('resultsSection');
    const finesList = document.getElementById('finesList');
    
    if (!resultsSection || !finesList) {
        console.error('Required DOM elements not found');
        return;
    }

    if (!fines || fines.length === 0) {
        finesList.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--success); margin-bottom: 1rem;"></i>
                <h3>No fines found!</h3>
                <p>No outstanding fines found for license plate: <strong>${licensePlate}</strong></p>
            </div>
        `;
    } else {
        let finesHTML = `<h4>Fines for: <strong>${licensePlate}</strong></h4>`;
        finesHTML += `<div class="fines-container">`;
        
        fines.forEach(fine => {
            const violationDate = new Date(fine.violationDate).toLocaleDateString();
            const dueDate = fine.dueDate ? new Date(fine.dueDate).toLocaleDateString() : 'Not set';
            const statusClass = fine.status === 'PAID' ? 'status-paid' : 
                              fine.status === 'UNPAID' ? 'status-unpaid' : 'status-other';
            
            finesHTML += `
                <div class="fine-item ${statusClass}">
                    <div class="fine-header">
                        <span class="violation-type">${fine.violationType}</span>
                        <span class="fine-amount">$${fine.amount}</span>
                    </div>
                    <div class="fine-details">
                        <p><strong>Description:</strong> ${fine.description || 'No description'}</p>
                        <p><strong>Violation Date:</strong> ${violationDate}</p>
                        <p><strong>Due Date:</strong> ${dueDate}</p>
                        <p><strong>Status:</strong> <span class="status-badge">${fine.status}</span></p>
                        <p><strong>Issued By:</strong> ${fine.issuedByUsername || 'System'}</p>
                    </div>
                    ${fine.status === 'UNPAID' ? `
                        <div class="fine-actions">
                            <button class="btn btn-primary btn-sm" onclick="payFine(${fine.id}, '${licensePlate}')">
                                <i class="fas fa-credit-card"></i> Pay Now
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        finesHTML += `</div>`;
        finesList.innerHTML = finesHTML;
    }
    
    resultsSection.style.display = 'block';
}

async function payFine(fineId, licensePlate) {
    if (!confirm('Are you sure you want to pay this fine?')) {
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/fines/pay/${fineId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ licensePlateNumber: licensePlate })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            showStatus('Fine paid successfully!', 'success');
            checkFines(); // Refresh the list
        } else {
            showStatus('Error: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error paying fine:', error);
        showStatus('Failed to pay fine. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

// Status message function
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
    
    .fines-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .fine-item {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1rem;
        background: white;
    }
    .fine-item.status-unpaid {
        border-left: 4px solid var(--danger);
    }
    .fine-item.status-paid {
        border-left: 4px solid var(--success);
    }
    .fine-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .violation-type {
        font-weight: bold;
        color: var(--secondary);
    }
    .fine-amount {
        font-size: 1.2rem;
        font-weight: bold;
        color: var(--danger);
    }
    .fine-details p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
    }
    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .status-unpaid .status-badge {
        background: #fef2f2;
        color: var(--danger);
    }
    .status-paid .status-badge {
        background: #f0fdf4;
        color: var(--success);
    }
    .fine-actions {
        margin-top: 1rem;
        text-align: right;
    }
    .btn-sm {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);