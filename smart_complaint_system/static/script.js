// Smart Complaint System - Voice Recognition & Features

// Voice Recognition using Web Speech API
function startVoiceInput() {
    const statusEl = document.getElementById('voice-status');
    const voiceBtn = document.querySelector('.voice-btn');
    
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showStatus('error', 'Voice recognition not supported in this browser. Please use Chrome or Edge.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Set language based on current selection
    const lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Show listening state
    voiceBtn.classList.add('listening');
    showStatus('listening', currentLang === 'hi' ? 'सुन रहे हैं...' : 'Listening...');

    recognition.start();

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('complaint-input').value = transcript;
        showStatus('success', '✓ ' + transcript);
        
        // Remove listening animation
        voiceBtn.classList.remove('listening');
        
        // Clear status after 3 seconds
        setTimeout(() => {
            statusEl.innerHTML = '';
        }, 3000);
    };

    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
        let errorMsg = currentLang === 'hi' ? 'आवाज़ पहचान में त्रुटि' : 'Voice recognition error';
        
        if (event.error === 'no-speech') {
            errorMsg = currentLang === 'hi' ? 'कोई आवाज़ नहीं मिली' : 'No speech detected';
        } else if (event.error === 'not-allowed') {
            errorMsg = currentLang === 'hi' ? 'माइक्रोफ़ोन की अनुमति नहीं है' : 'Microphone permission denied';
        }
        
        showStatus('error', errorMsg);
        voiceBtn.classList.remove('listening');
    };

    recognition.onend = function() {
        voiceBtn.classList.remove('listening');
    };
}

// Show status message
function showStatus(type, message) {
    const statusEl = document.getElementById('voice-status');
    if (!statusEl) return;
    
    statusEl.innerHTML = `<span class="${type}">${message}</span>`;
}

// Language toggle function
function setLanguage(lang) {
    currentLang = lang;
    
    // Update button states
    const btnEn = document.getElementById('btn-en');
    const btnHi = document.getElementById('btn-hi');
    
    if (btnEn && btnHi) {
        btnEn.classList.toggle('active', lang === 'en');
        btnHi.classList.toggle('active', lang === 'hi');
    }
    
    // Update placeholders
    const nameInput = document.getElementById('name-input');
    const locationInput = document.getElementById('location-input');
    const complaintInput = document.getElementById('complaint-input');
    const cidInput = document.getElementById('cid-input');
    
    if (nameInput) {
        nameInput.placeholder = lang === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name';
    }
    
    if (locationInput) {
        locationInput.placeholder = lang === 'hi' ? 'स्थान दर्ज करें' : 'Enter location';
    }
    
    if (complaintInput) {
        complaintInput.placeholder = lang === 'hi' ? 'अपनी शिकायत का वर्णन करें...' : 'Describe your complaint...';
    }
    
    if (cidInput) {
        cidInput.placeholder = lang === 'hi' ? 'शिकायत आईडी दर्ज करें' : 'Enter Complaint ID';
    }
    
    // Show/hide Hindi elements
    const hiElements = document.querySelectorAll('[id$="-hi"]');
    hiElements.forEach(el => {
        if (el) {
            el.style.display = lang === 'hi' ? 'inline' : 'none';
        }
    });
    
    // Save language preference to server
    fetch('/set_language/' + lang)
        .then(response => response.json())
        .then(data => {
            console.log('Language set to:', data.language);
        })
        .catch(error => {
            console.error('Error setting language:', error);
        });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language from server
    const langElement = document.querySelector('[data-lang]');
    if (langElement) {
        currentLang = langElement.getAttribute('data-lang');
    }
    
    // Initialize language display
    setLanguage(currentLang || 'en');
});

// Smooth scroll for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Form validation enhancement
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        const requiredInputs = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#f5576c';
            } else {
                input.style.borderColor = '#e0e0e0';
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            alert(currentLang === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें' : 'Please fill all required fields');
        }
    });
});

// Add animation on focus
document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    el.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});
