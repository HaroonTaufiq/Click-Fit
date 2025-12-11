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
     * Fetch images from API or use demo data
     * @returns {Promise} jQuery AJAX promise or resolved promise with demo data
     */
    function fetchImages() {
        // Show loading state
        $galleryLoading.show();
        $galleryGrid.hide();
        $galleryEmpty.hide();

        // Use demo data if in demo mode
        if (CONFIG.DEMO_MODE) {
            return $.Deferred(function(deferred) {
                setTimeout(function() {
                    const files = CONFIG.DEMO_DATA.GALLERY_IMAGES;
                    renderGallery(files, true); // true = demo mode
                    $galleryGrid.fadeIn(200);
                    $galleryLoading.hide();
                    showDemoNotice();
                    deferred.resolve({ success: true, files: files });
                }, 500); // Simulate loading delay
            }).promise();
        }

        return $.ajax({
            url: `${API_URL}/list`,
            method: 'GET',
            success: function(response) {
                if (response.success && response.files && response.files.length > 0) {
                    renderGallery(response.files, false);
                    $galleryGrid.fadeIn(200);
                } else {
                    $galleryEmpty.fadeIn(200);
                }
            },
            error: function(xhr) {
                console.error('Failed to fetch images:', xhr);
                // Fallback to demo data on error
                const files = CONFIG.DEMO_DATA.GALLERY_IMAGES;
                renderGallery(files, true);
                $galleryGrid.fadeIn(200);
                showDemoNotice();
            },
            complete: function() {
                $galleryLoading.hide();
            }
        });
    }

    /**
     * Show demo mode notice
     */
    function showDemoNotice() {
        if ($('#demo-notice-gallery').length === 0) {
            $galleryGrid.before(`
                <div id="demo-notice-gallery" class="alert alert-info" style="margin-bottom: 1rem; padding: 0.75rem; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Demo Mode:</strong> No database connected. Showing sample images from Unsplash.
                </div>
            `);
        }
    }

    /**
     * Render gallery grid
     * @param {Array} files - Array of file objects
     * @param {boolean} isDemo - Whether using demo data
     */
    function renderGallery(files, isDemo = false) {
        const items = files.map(file => {
            const sizeKB = (file.size / 1024).toFixed(1);
            const sizeDisplay = sizeKB > 1024 
                ? `${(sizeKB / 1024).toFixed(1)} MB` 
                : `${sizeKB} KB`;

            // Use demo URL or actual upload URL
            const imgSrc = isDemo && file.url 
                ? file.url 
                : `${UPLOADS_URL}/${escapeHtml(file.filename)}`;

            return `
                <div class="gallery-item" data-filename="${escapeHtml(file.filename)}" data-demo="${isDemo}">
                    <img src="${imgSrc}" 
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
                            title="${isDemo ? 'Demo mode' : 'Delete image'}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');

        $galleryGrid.html(items);

        // Bind click events
        bindGalleryEvents(isDemo);
    }

    /**
     * Bind gallery item events
     * @param {boolean} isDemo - Whether using demo data
     */
    function bindGalleryEvents(isDemo = false) {
        // Open lightbox on image click
        $('.gallery-item').on('click', function(e) {
            if (!$(e.target).closest('.gallery-item-delete').length) {
                const $item = $(this);
                const filename = $item.data('filename');
                const imgSrc = $item.find('img').attr('src');
                openLightbox(imgSrc);
            }
        });

        // Delete image
        $('.gallery-item-delete').on('click', function(e) {
            e.stopPropagation();
            const $item = $(this).closest('.gallery-item');
            const filename = $(this).data('filename');
            const itemIsDemo = $item.data('demo') === true || $item.data('demo') === 'true';
            
            if (itemIsDemo || CONFIG.DEMO_MODE) {
                // Demo mode - just remove from UI
                if (confirm(`Demo Mode: "${filename}" would be deleted. Remove from view?`)) {
                    $item.fadeOut(300, function() {
                        $(this).remove();
                    });
                }
            } else {
                if (confirm(`Are you sure you want to delete "${filename}"?`)) {
                    deleteImage(filename);
                }
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
