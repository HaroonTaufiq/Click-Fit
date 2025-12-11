/**
 * Upload Module
 * Handles drag & drop and file upload functionality
 */

const Upload = (function() {
    'use strict';

    // DOM Elements
    let $dropZone;
    let $fileInput;
    let $progressContainer;
    let $progressBar;
    let $progressText;
    let $previewContainer;
    let $previewGrid;
    let $statusContainer;

    // State
    let uploadedFiles = [];

    /**
     * Initialize DOM element references
     */
    function cacheElements() {
        $dropZone = $('#drop-zone');
        $fileInput = $('#fileElem');
        $progressContainer = $('#upload-progress');
        $progressBar = $progressContainer.find('.progress-bar');
        $progressText = $progressContainer.find('.progress-text');
        $previewContainer = $('#preview-container');
        $previewGrid = $('#preview-grid');
        $statusContainer = $('#upload-status');
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Prevent click events on file input from bubbling to drop zone
        $fileInput.on('click', function(e) {
            e.stopPropagation();
        });

        // Click to upload
        $dropZone.on('click', function(e) {
            $fileInput.trigger('click');
        });

        // File input change
        $fileInput.on('change', function(e) {
            handleFiles(this.files);
        });

        // Drag and drop events
        $dropZone
            .on('dragenter dragover', function(e) {
                preventDefaults(e);
                $(this).addClass('highlight');
            })
            .on('dragleave drop', function(e) {
                preventDefaults(e);
                $(this).removeClass('highlight');
            })
            .on('drop', function(e) {
                preventDefaults(e);
                const dt = e.originalEvent.dataTransfer;
                handleFiles(dt.files);
            });

        // Prevent defaults on document for drag events
        $(document)
            .on('dragenter dragover dragleave drop', preventDefaults);
    }

    /**
     * Prevent default browser behavior
     * @param {Event} e - Event object
     */
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Handle selected files
     * @param {FileList} files - Selected files
     */
    function handleFiles(files) {
        if (!files || files.length === 0) return;

        const filesArray = Array.from(files);
        
        filesArray.forEach(function(file) {
            // Validate file
            const validation = validateFile(file);
            if (!validation.valid) {
                showStatus(validation.message, 'error');
                return;
            }

            // Show preview
            showPreview(file);

            // Upload file
            uploadFile(file);
        });
    }

    /**
     * Validate file type and size
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    function validateFile(file) {
        // Check file type
        if (!CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
            return {
                valid: false,
                message: CONFIG.MESSAGES.INVALID_FILE_TYPE
            };
        }

        // Check file size
        if (file.size > CONFIG.UPLOAD.MAX_FILE_SIZE) {
            return {
                valid: false,
                message: CONFIG.MESSAGES.FILE_TOO_LARGE
            };
        }

        return { valid: true };
    }

    /**
     * Show image preview
     * @param {File} file - File to preview
     */
    function showPreview(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewId = 'preview-' + Date.now();
            const previewHtml = `
                <div class="col-6 col-md-4 col-lg-3 preview-item" id="${previewId}">
                    <img src="${e.target.result}" alt="${file.name}">
                    <button class="preview-remove" data-id="${previewId}" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            $previewGrid.append(previewHtml);
            $previewContainer.addClass('has-images');

            // Bind remove button
            $(`#${previewId} .preview-remove`).on('click', function(e) {
                e.stopPropagation();
                removePreview($(this).data('id'));
            });
        };

        reader.readAsDataURL(file);
    }

    /**
     * Remove preview image
     * @param {string} previewId - Preview element ID
     */
    function removePreview(previewId) {
        $(`#${previewId}`).fadeOut(300, function() {
            $(this).remove();
            
            // Hide container if no more images
            if ($previewGrid.children().length === 0) {
                $previewContainer.removeClass('has-images');
            }
        });
    }

    /**
     * Upload file to server
     * @param {File} file - File to upload
     */
    function uploadFile(file) {
        const formData = new FormData();
        formData.append('image', file);

        // Show progress
        showProgress();

        API.uploadImage(formData, updateProgress)
            .done(function(response) {
                hideProgress();
                showStatus(CONFIG.MESSAGES.UPLOAD_SUCCESS, 'success');
                uploadedFiles.push(response.filename);
                
                // Refresh gallery after successful upload
                if (typeof Gallery !== 'undefined' && Gallery.refresh) {
                    Gallery.refresh();
                }
            })
            .fail(function(error) {
                hideProgress();
                showStatus(CONFIG.MESSAGES.UPLOAD_ERROR, 'error');
                console.error('Upload failed:', error);
            });
    }

    /**
     * Show upload progress bar
     */
    function showProgress() {
        $progressBar.css('width', '0%');
        $progressText.text('Uploading...');
        $progressContainer.fadeIn(200);
    }

    /**
     * Update progress bar
     * @param {number} percent - Upload percentage
     */
    function updateProgress(percent) {
        $progressBar.css('width', percent + '%');
        $progressText.text(`Uploading... ${Math.round(percent)}%`);
    }

    /**
     * Hide upload progress bar
     */
    function hideProgress() {
        $progressContainer.fadeOut(200, function() {
            $progressBar.css('width', '0%');
        });
    }

    /**
     * Show status message
     * @param {string} message - Message to display
     * @param {string} type - Message type ('success' or 'error')
     */
    function showStatus(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        const statusHtml = `
            <div class="${alertClass}">
                <i class="fas ${iconClass} me-2"></i>
                ${message}
            </div>
        `;

        $statusContainer.html(statusHtml).fadeIn(200);

        // Auto-hide after 5 seconds
        setTimeout(function() {
            $statusContainer.fadeOut(200, function() {
                $(this).empty();
            });
        }, 5000);
    }

    /**
     * Get list of uploaded files
     * @returns {Array} List of uploaded filenames
     */
    function getUploadedFiles() {
        return uploadedFiles;
    }

    /**
     * Initialize upload module
     */
    function init() {
        cacheElements();
        bindEvents();
    }

    // Public API
    return {
        init: init,
        getUploadedFiles: getUploadedFiles
    };
})();
