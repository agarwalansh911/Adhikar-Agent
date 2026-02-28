// API Configuration
const API_URL = 'http://localhost:8000/process-documents';

// File inputs
const fileInputs = {
    aadhaar: document.getElementById('aadhaar'),
    voter: document.getElementById('voter'),
    ration: document.getElementById('ration'),
    caste: document.getElementById('caste')
};

// File name displays
const fileNames = {
    aadhaar: document.getElementById('aadhaar-name'),
    voter: document.getElementById('voter-name'),
    ration: document.getElementById('ration-name'),
    caste: document.getElementById('caste-name')
};

// Update file name display when file is selected
Object.keys(fileInputs).forEach(key => {
    fileInputs[key].addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || 'No file chosen';
        fileNames[key].textContent = fileName;
        fileNames[key].style.color = e.target.files[0] ? '#48bb78' : '#718096';
    });
});

// Submit button handler
document.getElementById('submitBtn').addEventListener('click', async () => {
    // Collect all files
    const files = [];
    let hasFiles = false;
    
    Object.values(fileInputs).forEach(input => {
        if (input.files[0]) {
            files.push(input.files[0]);
            hasFiles = true;
        }
    });
    
    if (!hasFiles) {
        alert('Please upload at least one document');
        return;
    }
    
    // Show terminal
    document.getElementById('terminalSection').style.display = 'block';
    document.getElementById('submitBtn').disabled = true;
    
    // Scroll to terminal
    document.getElementById('terminalSection').scrollIntoView({ behavior: 'smooth' });
    
    // Sequential log display
    await showLog('log1', 500);
    await showLog('log2', 1500);
    await showLog('log3', 1000);
    await showLog('log4', 1500);
    await showLog('log5', 1000);
    
    // Send to backend
    await processDocuments(files);
});

// Show terminal log with delay
function showLog(logId, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            document.getElementById(logId).style.display = 'flex';
            resolve();
        }, delay);
    });
}

// Main API call
async function processDocuments(files) {
    const formData = new FormData();
    
    files.forEach(file => {
        formData.append('files', file);
    });
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Processing failed');
        }
        
        // Success!
        await showLog('log6', 500);
        
        // Get PDF blob
        const blob = await response.blob();
        
        // Store for download
        window.generatedPDF = blob;
        
        // Show success section
        setTimeout(() => {
            document.getElementById('terminalSection').style.display = 'none';
            document.getElementById('successSection').style.display = 'block';
            document.getElementById('successSection').scrollIntoView({ behavior: 'smooth' });
        }, 1000);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

// Download handler
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (window.generatedPDF) {
        const url = window.URL.createObjectURL(window.generatedPDF);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PMAY_Application_Form.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
});

// Error handler
function showError(message) {
    document.getElementById('terminalSection').style.display = 'none';
    document.getElementById('errorSection').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorSection').scrollIntoView({ behavior: 'smooth' });
}
