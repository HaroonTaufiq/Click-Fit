/**
 * API Module
 * Handles all AJAX calls and API interactions
 */

const API = (function() {
    'use strict';

    /**
     * Fetch daily fact from Numbers API
     * @returns {Promise} jQuery AJAX promise
     */
    function fetchDailyFact() {
        return $.ajax({
            url: CONFIG.API.NUMBERS_API,
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    }

    /**
     * Display the fetched fact on the page
     * @param {Object} data - Response data from Numbers API
     */
    function displayFact(data) {
        const $content = $('#api-content');
        const $details = $('#fact-details');
        const $year = $('#fact-year');

        // Hide loading spinner and show content
        $content
            .hide()
            .html(`<p class="fact-text">${data.text}</p>`)
            .fadeIn(CONFIG.ANIMATION.FADE_DURATION);

        // Show year badge if available
        if (data.year) {
            $year.text(`Year: ${data.year}`);
            $details.fadeIn(500);
        }
    }

    /**
     * Handle API error
     * @param {Object} error - Error object
     */
    function handleFactError(error) {
        console.error('Error fetching daily fact:', error);
        $('#api-content')
            .html(`<p class="fact-text">${CONFIG.MESSAGES.FACT_ERROR}</p>`)
            .addClass('text-muted');
    }

    /**
     * Upload image to server
     * @param {FormData} formData - Form data containing the image
     * @param {Function} onProgress - Progress callback function
     * @returns {Promise} jQuery AJAX promise
     */
    function uploadImage(formData, onProgress) {
        return $.ajax({
            url: CONFIG.API.UPLOAD_ENDPOINT,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                if (onProgress) {
                    xhr.upload.addEventListener('progress', function(evt) {
                        if (evt.lengthComputable) {
                            const percentComplete = (evt.loaded / evt.total) * 100;
                            onProgress(percentComplete);
                        }
                    }, false);
                }
                return xhr;
            }
        });
    }

    /**
     * Initialize API module - fetch daily fact on page load
     */
    function init() {
        fetchDailyFact()
            .done(displayFact)
            .fail(handleFactError);
    }

    // Public API
    return {
        init: init,
        fetchDailyFact: fetchDailyFact,
        uploadImage: uploadImage
    };
})();
