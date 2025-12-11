/**
 * Gallery Module
 * Handles displaying uploaded images in a grid with lightbox
 */

const Gallery = (function() {
    'use strict';

    // API endpoint (uses CONFIG from config.js)
    const API_URL = CONFIG.API.UPLOAD_ENDPOINT;
    const UPLOADS_URL = `${CONFIG.API_BASE_URL}/uploads`;

    // DOM Elements
    let $galleryLoading;
    let $galleryGrid;
    let $galleryEmpty;
    let $refreshBtn;
    let $lightboxModal;

    /**
     * Initialize DOM element references
     */
    function cacheElements() {
        $galleryLoading = $('#gallery-loading');
        $galleryGrid = $('#gallery-grid');
        $galleryEmpty = $('#gallery-empty');
        $refreshBtn = $('#refreshGalleryBtn');
    }

    /**
     * Create lightbox modal if it doesn't exist
     */
    function createLightbox() {
        if ($('#lightbox-modal').length === 0) {
            const lightboxHtml = `
                <div id="lightbox-modal" class="lightbox-modal">
                    <span class="lightbox-close">&times;</span>
                    <div class="lightbox-content">
                        <img id="lightbox-image" src="" alt="Full size image">
                    </div>
                </div>
            `;
            $('body').append(lightboxHtml);
        }
        $lightboxModal = $('#lightbox-modal');

        // Close on click
        $lightboxModal.on('click', function(e) {
            if ($(e.target).hasClass('lightbox-modal') || $(e.target).hasClass('lightbox-close')) {
                closeLightbox();
            }
        });

        // Close on escape key
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $lightboxModal.hasClass('active')) {
                closeLightbox();
            }
        });
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Refresh button
        $refreshBtn.on('click', function() {
            $(this).find('i').addClass('fa-spin');
            fetchImages().always(() => {
                setTimeout(() => {
                    $(this).find('i').removeClass('fa-spin');
                }, 500);
            });
        });
    }

    /**
     * Fetch images from API
     * @returns {Promise} jQuery AJAX promise
     */
    function fetchImages() {
        // Show loading state
        $galleryLoading.show();
        $galleryGrid.hide();
        $galleryEmpty.hide();

        return $.ajax({
            url: `${API_URL}/list`,
            method: 'GET',
            success: function(response) {
                if (response.success && response.files && response.files.length > 0) {
                    renderGallery(response.files);
                    $galleryGrid.fadeIn(200);
                } else {
                    $galleryEmpty.fadeIn(200);
                }
            },
            error: function(xhr) {
                console.error('Failed to fetch images:', xhr);
                $galleryEmpty.html(`
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load gallery. Please try again.</p>
                `).fadeIn(200);
            },
            complete: function() {
                $galleryLoading.hide();
            }
        });
    }

    /**
     * Render gallery grid
     * @param {Array} files - Array of file objects
     */
    function renderGallery(files) {
        const items = files.map(file => {
            const sizeKB = (file.size / 1024).toFixed(1);
            const sizeDisplay = sizeKB > 1024 
                ? `${(sizeKB / 1024).toFixed(1)} MB` 
                : `${sizeKB} KB`;

            return `
                <div class="gallery-item" data-filename="${escapeHtml(file.filename)}">
                    <img src="${UPLOADS_URL}/${escapeHtml(file.filename)}" 
                         alt="${escapeHtml(file.filename)}"
                         loading="lazy">
                    <div class="gallery-item-overlay">
                        <div class="gallery-item-name" title="${escapeHtml(file.filename)}">
                            ${escapeHtml(file.filename)}
                        </div>
                        <div class="gallery-item-size">${sizeDisplay}</div>
                    </div>
                    <button class="gallery-item-delete" 
                            data-filename="${escapeHtml(file.filename)}" 
                            title="Delete image">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        $galleryGrid.html(items);

        // Bind click events
        bindGalleryEvents();
    }

    /**
     * Bind gallery item events
     */
    function bindGalleryEvents() {
        // Open lightbox on image click
        $('.gallery-item').on('click', function(e) {
            if (!$(e.target).closest('.gallery-item-delete').length) {
                const filename = $(this).data('filename');
                openLightbox(`${UPLOADS_URL}/${filename}`);
            }
        });

        // Delete image
        $('.gallery-item-delete').on('click', function(e) {
            e.stopPropagation();
            const filename = $(this).data('filename');
            if (confirm(`Are you sure you want to delete "${filename}"?`)) {
                deleteImage(filename);
            }
        });
    }

    /**
     * Open lightbox with image
     * @param {string} src - Image source URL
     */
    function openLightbox(src) {
        $('#lightbox-image').attr('src', src);
        $lightboxModal.addClass('active');
        $('body').css('overflow', 'hidden');
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        $lightboxModal.removeClass('active');
        $('body').css('overflow', '');
        $('#lightbox-image').attr('src', '');
    }

    /**
     * Delete image
     * @param {string} filename - File to delete
     */
    function deleteImage(filename) {
        $.ajax({
            url: `${API_URL}/${encodeURIComponent(filename)}`,
            method: 'DELETE',
            success: function() {
                // Remove item with animation
                $(`.gallery-item[data-filename="${filename}"]`).fadeOut(300, function() {
                    $(this).remove();
                    
                    // Check if gallery is empty
                    if ($galleryGrid.children().length === 0) {
                        $galleryGrid.hide();
                        $galleryEmpty.fadeIn(200);
                    }
                });
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.message || 'Failed to delete image');
            }
        });
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Refresh gallery (public method)
     */
    function refresh() {
        return fetchImages();
    }

    /**
     * Initialize gallery module
     */
    function init() {
        cacheElements();
        createLightbox();
        bindEvents();
        fetchImages(); // Load images on page load
    }

    // Public API
    return {
        init: init,
        refresh: refresh
    };
})();
