/**
 * Configuration Module
 * Contains all configurable constants and settings
 */

// ============================================
// DEPLOYMENT CONFIGURATION
// Change this URL to your deployed backend URL before deploying frontend
// ============================================
const API_BASE_URL = 'https://click-fit-production.up.railway.app';
// For production, change to your backend URL, e.g.:
// const API_BASE_URL = 'https://your-backend.railway.app';

const CONFIG = {
    // API Base URL
    API_BASE_URL: API_BASE_URL,
    
    // API Endpoints
    API: {
        NUMBERS_API: 'http://numbersapi.com/1/30/date?json',
        UPLOAD_ENDPOINT: `${API_BASE_URL}/api/upload`,
        USERS_ENDPOINT: `${API_BASE_URL}/api/users`,
        HEALTH_ENDPOINT: `${API_BASE_URL}/api/health`
    },

    // Upload Settings
    UPLOAD: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },

    // Animation Settings
    ANIMATION: {
        SCROLL_OFFSET: 100,
        NAVBAR_SCROLL_THRESHOLD: 50,
        FADE_DURATION: 1000
    },

    // Owl Carousel Settings
    CAROUSEL: {
        TESTIMONIALS: {
            loop: true,
            margin: 30,
            nav: true,
            dots: true,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
            responsive: {
                0: { items: 1 },
                768: { items: 2 },
                1024: { items: 3 }
            }
        }
    },

    // Messages
    MESSAGES: {
        UPLOAD_SUCCESS: 'Image uploaded successfully!',
        UPLOAD_ERROR: 'Failed to upload image. Please try again.',
        FILE_TOO_LARGE: 'File is too large. Maximum size is 5MB.',
        INVALID_FILE_TYPE: 'Invalid file type. Please upload an image (JPG, PNG, GIF, WEBP).',
        LOADING_FACT: 'Loading today\'s fitness motivation...',
        FACT_ERROR: 'Stay active! (Could not load daily fact)'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.UPLOAD);
Object.freeze(CONFIG.ANIMATION);
Object.freeze(CONFIG.CAROUSEL);
Object.freeze(CONFIG.MESSAGES);

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.UPLOAD);
Object.freeze(CONFIG.ANIMATION);
Object.freeze(CONFIG.CAROUSEL);
Object.freeze(CONFIG.MESSAGES);
