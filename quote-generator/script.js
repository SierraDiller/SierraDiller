// DOM elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const quoteCard = document.getElementById('quoteCard');

// API endpoint
const API_URL = 'https://api.quotable.io/random';

// Current quote data
let currentQuote = {
    content: '',
    author: ''
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load initial quote
    fetchQuote();
    
    // Add event listeners
    newQuoteBtn.addEventListener('click', fetchQuote);
    copyBtn.addEventListener('click', copyToClipboard);
    shareBtn.addEventListener('click', shareQuote);
});

// Fetch random quote from API
async function fetchQuote() {
    try {
        // Show loading state
        setLoadingState(true);
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch quote');
        }
        
        const data = await response.json();
        
        // Update current quote
        currentQuote = {
            content: data.content,
            author: data.author
        };
        
        // Update UI with animation
        updateQuoteDisplay();
        
    } catch (error) {
        console.error('Error fetching quote:', error);
        showError('Failed to load quote. Please try again.');
    } finally {
        // Hide loading state
        setLoadingState(false);
    }
}

// Update quote display with animation
function updateQuoteDisplay() {
    // Add fade out effect
    quoteCard.style.opacity = '0';
    
    setTimeout(() => {
        // Update content
        quoteText.textContent = currentQuote.content;
        quoteAuthor.textContent = `- ${currentQuote.author}`;
        
        // Add fade in effect
        quoteCard.style.opacity = '1';
        quoteCard.classList.add('fade-in');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            quoteCard.classList.remove('fade-in');
        }, 500);
    }, 200);
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        newQuoteBtn.classList.add('loading');
        newQuoteBtn.disabled = true;
    } else {
        newQuoteBtn.classList.remove('loading');
        newQuoteBtn.disabled = false;
    }
}

// Copy quote to clipboard
async function copyToClipboard() {
    try {
        const textToCopy = `"${currentQuote.content}" - ${currentQuote.author}`;
        
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(textToCopy);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
        
        showSuccess('Quote copied to clipboard!');
        
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy quote');
    }
}

// Share quote on Twitter
function shareQuote() {
    try {
        const text = `"${currentQuote.content}" - ${currentQuote.author}`;
        const url = encodeURIComponent(window.location.href);
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
        
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        
    } catch (error) {
        console.error('Failed to share:', error);
        showError('Failed to share quote');
    }
}

// Show success message
function showSuccess(message) {
    showNotification(message, 'success');
}

// Show error message
function showError(message) {
    showNotification(message, 'error');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.background = '#48bb78';
    } else if (type === 'error') {
        notification.style.background = '#f56565';
    } else {
        notification.style.background = '#4299e1';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 