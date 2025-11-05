// Content script - handles image analysis and displays results
console.log('🛡️ RealReveal extension loaded');

let isAnalyzing = false;
let currentImageElement = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Message received:', request);
  
  if (request.action === "analyzeImage" && request.imageUrl) {
    console.log('🔍 Finding image with URL:', request.imageUrl);
    
    // Find the image element that was clicked
    const images = document.querySelectorAll('img');
    for (const img of images) {
      if (img.src === request.imageUrl) {
        console.log('✅ Found image element');
        currentImageElement = img;
        break;
      }
    }
    
    if (!currentImageElement) {
      console.warn('⚠️ Could not find image element, using default position');
    }
    
    analyzeImage(request.imageUrl);
    sendResponse({ success: true });
  }
  
  return true; // Keep channel open for async response
});

// Analyze image function
async function analyzeImage(imageUrl) {
  console.log('🚀 Starting analysis for:', imageUrl);
  
  if (isAnalyzing) {
    console.log('⏳ Already analyzing an image...');
    return;
  }
  
  isAnalyzing = true;
  showLoading();
  console.log('⏱️ Loading popup shown');
  
  try {
    console.log('📥 Fetching image...');
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    console.log('✅ Image fetched, size:', imageBlob.size);
    
    // Send to backend API
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.jpg');
    
    console.log('📤 Sending to backend...');
    const apiResponse = await fetch('http://127.0.0.1:5002/predict', {
      method: 'POST',
      body: formData
    });
    
    if (!apiResponse.ok) {
      throw new Error('API request failed with status: ' + apiResponse.status);
    }
    
    const result = await apiResponse.json();
    console.log('✅ Got result:', result);
    
    hideLoading();
    showResult(result);
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    hideLoading();
    showError(error.message);
  } finally {
    isAnalyzing = false;
    console.log('✅ Analysis complete');
  }
}

// Show loading overlay
function showLoading() {
  console.log('🔄 showLoading called');
  hideLoading(); // Remove any existing
  
  const popup = document.createElement('div');
  popup.id = 'realreveal-loading';
  popup.className = 'realreveal-popup';
  popup.innerHTML = `
    <div class="realreveal-spinner"></div>
    <p>Analyzing...</p>
  `;
  
  // Position near image or center if no image found
  if (currentImageElement) {
    const rect = currentImageElement.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = Math.min(rect.bottom + 10, window.innerHeight - 200) + 'px';
    popup.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 360)) + 'px';
    console.log('📍 Positioned at:', popup.style.top, popup.style.left);
  } else {
    // Center on screen if image not found
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    console.log('📍 Centered on screen');
  }
  
  document.body.appendChild(popup);
  console.log('✅ Loading popup added to DOM');
}

// Hide loading overlay
function hideLoading() {
  const loading = document.getElementById('realreveal-loading');
  if (loading) loading.remove();
}

// Show result modal
function showResult(result) {
  console.log('📊 showResult called with:', result);
  
  const isReal = result.detection === 'Real';
  const color = isReal ? '#10b981' : '#ef4444';
  const icon = isReal ? '✅' : '⚠️';
  
  const popup = document.createElement('div');
  popup.id = 'realreveal-result';
  popup.className = 'realreveal-popup';
  popup.innerHTML = `
    <div class="realreveal-header" style="background: ${color}">
      <span>${icon} ${result.detection}</span>
      <button class="realreveal-close">×</button>
    </div>
    <div class="realreveal-body">
      <div class="realreveal-confidence">
        <strong>Confidence:</strong> ${result.confidence}%
      </div>
      ${result.explanation ? `
        <div class="realreveal-explanation">
          <strong>AI Analysis:</strong>
          <p>${result.explanation}</p>
        </div>
      ` : ''}
    </div>
  `;
  
  // Position near image or center if no image found
  if (currentImageElement) {
    const rect = currentImageElement.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = Math.min(rect.bottom + 10, window.innerHeight - 400) + 'px';
    popup.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 360)) + 'px';
    console.log('📍 Result positioned at:', popup.style.top, popup.style.left);
  } else {
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    console.log('📍 Result centered on screen');
  }
  
  document.body.appendChild(popup);
  console.log('✅ Result popup added to DOM');
  
  // Close button handler
  const closeBtn = popup.querySelector('.realreveal-close');
  closeBtn.addEventListener('click', () => {
    console.log('❌ Close button clicked');
    popup.remove();
  });
  
  // Auto close after 10 seconds
  setTimeout(() => {
    if (document.getElementById('realreveal-result')) {
      console.log('⏰ Auto-closing result');
      popup.remove();
    }
  }, 10000);
}

// Show error modal
function showError(message) {
  const popup = document.createElement('div');
  popup.id = 'realreveal-error';
  popup.className = 'realreveal-popup';
  popup.innerHTML = `
    <div class="realreveal-header" style="background: #ef4444">
      <span>❌ Error</span>
      <button class="realreveal-close">×</button>
    </div>
    <div class="realreveal-body">
      <p>Failed to analyze image. Please make sure the backend server is running at <code>http://127.0.0.1:5002</code></p>
      <p class="realreveal-error-detail">${message}</p>
    </div>
  `;
  
  // Position near image
  if (currentImageElement) {
    const rect = currentImageElement.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = Math.min(rect.bottom + 10, window.innerHeight - 300) + 'px';
    popup.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 360)) + 'px';
  }
  
  document.body.appendChild(popup);
  
  // Close button handler
  const closeBtn = popup.querySelector('.realreveal-close');
  closeBtn.addEventListener('click', () => {
    popup.remove();
  });
  
  // Auto close after 5 seconds
  setTimeout(() => {
    if (document.getElementById('realreveal-error')) {
      popup.remove();
    }
  }, 5000);
}

console.log('✨ Right-click on any image and select "Verify with RealReveal"');
