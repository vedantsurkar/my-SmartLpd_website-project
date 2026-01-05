const BACKEND_URL = 'http://localhost:8080';

// Global variable to store all fines for search filtering
let allFines = [];

// Check authentication and role
document.addEventListener('DOMContentLoaded', function() {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!authToken) {
        alert('Please login first to manage fines.');
        window.location.href = 'login.html';
        return;
    }

    if (userRole !== 'AUTHORITY') {
        alert('Access denied. This page is for government authorities only.');
        window.location.href = 'index.html';
        return;
    }

    updateNavigation();
    loadFineStats();
    loadAllFines();

    // Pre-fill license plate if detected from detection page
    const detectedPlate = localStorage.getItem('detectedPlate');
    if (detectedPlate) {
        document.getElementById('fineLicensePlate').value = detectedPlate;
        localStorage.removeItem('detectedPlate'); // Clear after use
    }

    // Event listeners
    document.getElementById('issueFineBtn').addEventListener('click', issueFine);
    document.getElementById('refreshFinesBtn').addEventListener('click', function() {
        loadFineStats();
        loadAllFines();
    });
    
    // NEW: Search functionality
    document.getElementById('fineSearch').addEventListener('input', handleSearch);
    document.getElementById('exportFinesBtn').addEventListener('click', exportFines);
});

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

// Search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    
    if (!searchTerm) {
        // If search is empty, show all fines
        displayAllFines(allFines);
        return;
    }
    
    // Filter fines based on search term
    const filteredFines = allFines.filter(fine => 
        fine.licensePlateNumber.toLowerCase().includes(searchTerm) ||
        fine.violationType.toLowerCase().includes(searchTerm) ||
        (fine.description && fine.description.toLowerCase().includes(searchTerm)) ||
        fine.status.toLowerCase().includes(searchTerm)
    );
    
    displayAllFines(filteredFines);
}

// Export functionality (basic implementation)
function exportFines() {
    try {
        // Create CSV content
        let csvContent = "License Plate,Amount,Violation Type,Description,Violation Date,Due Date,Status,Issued By\n";
        
        allFines.forEach(fine => {
            const violationDate = new Date(fine.violationDate).toLocaleDateString();
            const dueDate = fine.dueDate ? new Date(fine.dueDate).toLocaleDateString() : 'Not set';
            const description = fine.description ? `"${fine.description.replace(/"/g, '""')}"` : '';
            
            csvContent += `"${fine.licensePlateNumber}",${fine.amount},"${fine.violationType}",${description},"${violationDate}","${dueDate}","${fine.status}","${fine.issuedByUsername || 'System'}"\n`;
        });
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `fines_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showStatus('Fines exported successfully!', 'success');
    } catch (error) {
        console.error('Error exporting fines:', error);
        showStatus('Failed to export fines', 'error');
    }
}

async function loadFineStats() {
    try {
        console.log('📊 Loading fine statistics...');
        
        const response = await fetch(`${BACKEND_URL}/api/fines/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('📊 Stats result:', result);

        if (result.success) {
            // Update the statistics boxes
            document.getElementById('totalFines').textContent = result.stats.totalFines || 0;
            document.getElementById('unpaidFines').textContent = result.stats.unpaidFines || 0;
            document.getElementById('paidFines').textContent = result.stats.paidFines || 0;
        } else {
            console.error('Failed to load stats:', result.message);
            // Set default values
            document.getElementById('totalFines').textContent = '0';
            document.getElementById('unpaidFines').textContent = '0';
            document.getElementById('paidFines').textContent = '0';
        }
    } catch (error) {
        console.error('Error loading fine stats:', error);
        // Set default values on error
        document.getElementById('totalFines').textContent = '0';
        document.getElementById('unpaidFines').textContent = '0';
        document.getElementById('paidFines').textContent = '0';
    }
}

async function issueFine() {
    const licensePlate = document.getElementById('fineLicensePlate').value.trim().toUpperCase();
    const violationType = document.getElementById('violationType').value;
    const amount = parseFloat(document.getElementById('fineAmount').value);
    const description = document.getElementById('fineDescription').value.trim();

    if (!licensePlate || !violationType || !amount || amount <= 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }

    const issueBtn = document.getElementById('issueFineBtn');
    issueBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Issuing...';
    issueBtn.disabled = true;

    try {
        const response = await fetch(`${BACKEND_URL}/api/fines`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                licensePlateNumber: licensePlate,
                violationType: violationType,
                amount: amount,
                description: description
            })
        });

        const result = await response.json();
        console.log('Issue fine result:', result);

        if (result.success) {
            alert('Fine issued successfully!');
            // Clear form
            document.getElementById('fineLicensePlate').value = '';
            document.getElementById('violationType').value = '';
            document.getElementById('fineAmount').value = '';
            document.getElementById('fineDescription').value = '';
            // Clear search
            document.getElementById('fineSearch').value = '';
            // Refresh both stats and fines list
            loadFineStats();
            loadAllFines();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error issuing fine:', error);
        alert('Failed to issue fine. Please try again.');
    } finally {
        issueBtn.innerHTML = '<i class="fas fa-gavel"></i> Issue Fine';
        issueBtn.disabled = false;
    }
}

async function loadAllFines() {
    try {
        console.log('📋 Loading all fines...');
        
        const response = await fetch(`${BACKEND_URL}/api/fines`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('All fines result:', result);

        if (result.success) {
            allFines = result.fines; // Store fines for search
            displayAllFines(allFines);
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error loading fines:', error);
        alert('Failed to load fines. Please try again.');
    }
}

function displayAllFines(fines) {
    const finesList = document.getElementById('allFinesList');
    
    if (!fines || fines.length === 0) {
        finesList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--gray);">
                <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>No fines found.</p>
            </div>
        `;
        return;
    }

    let finesHTML = `<div class="fines-container">`;
    
    fines.forEach(fine => {
        const violationDate = new Date(fine.violationDate).toLocaleDateString();
        const dueDate = fine.dueDate ? new Date(fine.dueDate).toLocaleDateString() : 'Not set';
        const statusClass = fine.status === 'PAID' ? 'status-paid' : 
                          fine.status === 'UNPAID' ? 'status-unpaid' : 'status-other';
        
        finesHTML += `
            <div class="fine-item ${statusClass}">
                <div class="fine-header">
                    <span class="license-plate">${fine.licensePlateNumber}</span>
                    <span class="fine-amount">$${fine.amount}</span>
                </div>
                <div class="fine-details">
                    <p><strong>Violation:</strong> ${fine.violationType}</p>
                    <p><strong>Description:</strong> ${fine.description || 'No description'}</p>
                    <p><strong>Violation Date:</strong> ${violationDate}</p>
                    <p><strong>Due Date:</strong> ${dueDate}</p>
                    <p><strong>Status:</strong> <span class="status-badge">${fine.status}</span></p>
                    <p><strong>Issued By:</strong> ${fine.issuedByUsername || 'System'}</p>
                </div>
                <div class="fine-actions">
                    <button class="btn btn-success btn-sm" onclick="updateFineStatus(${fine.id}, 'PAID')" ${fine.status === 'PAID' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> Mark Paid
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="updateFineStatus(${fine.id}, 'CANCELLED')" ${fine.status !== 'UNPAID' ? 'disabled' : ''}>
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
    });
    
    finesHTML += `</div>`;
    finesList.innerHTML = finesHTML;
}

async function updateFineStatus(fineId, status) {
    if (!confirm(`Are you sure you want to mark this fine as ${status}?`)) {
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/fines/${fineId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: status })
        });

        const result = await response.json();

        if (result.success) {
            alert('Fine status updated successfully!');
            // Refresh both stats and fines list
            loadFineStats();
            loadAllFines();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating fine status:', error);
        alert('Failed to update fine status. Please try again.');
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

// Add CSS for animations and search
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
    
    .search-box {
        position: relative;
        margin-bottom: 1rem;
    }
    
    .search-box input {
        padding-left: 2.5rem;
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 1rem;
    }
    
    .search-box i {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--gray);
    }
    
    .search-box input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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
    .fine-item.status-cancelled {
        border-left: 4px solid var(--gray);
    }
    .fine-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .license-plate {
        font-weight: bold;
        color: var(--secondary);
        font-size: 1.1rem;
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
    .status-cancelled .status-badge {
        background: #f1f5f9;
        color: var(--gray);
    }
    .fine-actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    .btn-sm {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
    }
    .btn-success {
        background-color: var(--success);
        color: white;
        border: none;
    }
    .btn-warning {
        background-color: #f59e0b;
        color: white;
        border: none;
    }
    textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 1rem;
        font-family: inherit;
        resize: vertical;
    }
    textarea:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    select {
        width: 100%;
        padding: 0.75rem 1rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 1rem;
        background: white;
    }
    select:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
`;
document.head.appendChild(style);