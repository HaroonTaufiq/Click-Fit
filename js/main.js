/**
 * Main Application Entry Point
 * Initializes all modules when DOM is ready
 */

$(document).ready(function() {
    'use strict';

    /**
     * Initialize all application modules
     */
    function initApp() {
        // Initialize API module (fetches daily fact)
        API.init();

        // Initialize Upload module (drag & drop)
        Upload.init();

        // Initialize Gallery module (image grid)
        Gallery.init();

        // Initialize Users module (form & list)
        Users.init();

        // Initialize Animations module
        Animations.init();

        console.log('Click Fit - Application initialized successfully!');
    }

    // Start the application
    initApp();
});
