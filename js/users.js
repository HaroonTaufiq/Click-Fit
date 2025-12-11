/**
 * Users Module
 * Handles user registration and display functionality
 */

const Users = (function() {
    'use strict';

    // API endpoint (uses CONFIG from config.js)
    const API_URL = CONFIG.API.USERS_ENDPOINT;

    // DOM Elements
    let $form;
    let $emailInput;
    let $passwordInput;
    let $typeSelect;
    let $submitBtn;
    let $formStatus;
    let $usersLoading;
    let $usersTableContainer;
    let $usersTableBody;
    let $usersEmpty;
    let $refreshBtn;

    /**
     * Initialize DOM element references
     */
    function cacheElements() {
        $form = $('#addUserForm');
        $emailInput = $('#userEmail');
        $passwordInput = $('#userPassword');
        $typeSelect = $('#userType');
        $submitBtn = $('#submitUserBtn');
        $formStatus = $('#form-status');
        $usersLoading = $('#users-loading');
        $usersTableContainer = $('#users-table-container');
        $usersTableBody = $('#users-table-body');
        $usersEmpty = $('#users-empty');
        $refreshBtn = $('#refreshUsersBtn');
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Form submission
        $form.on('submit', handleFormSubmit);

        // Refresh button
        $refreshBtn.on('click', function() {
            $(this).find('i').addClass('fa-spin');
            fetchUsers().always(() => {
                setTimeout(() => {
                    $(this).find('i').removeClass('fa-spin');
                }, 500);
            });
        });
    }

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    function handleFormSubmit(e) {
        e.preventDefault();

        const email = $emailInput.val().trim();
        const password = $passwordInput.val();
        const type = $typeSelect.val();

        // Client-side validation
        if (!email || !password) {
            showFormStatus('Please fill in all fields', 'error');
            return;
        }

        if (password.length < 6) {
            showFormStatus('Password must be at least 6 characters', 'error');
            return;
        }

        // Disable submit button
        $submitBtn.prop('disabled', true).html(
            '<i class="fas fa-spinner fa-spin me-2"></i>Creating...'
        );

        // Static mode: Simulate account creation (no backend)
        setTimeout(function() {
            showFormStatus('Demo: Account would be created! (No database connected)', 'success');
            $form[0].reset();
            $submitBtn.prop('disabled', false).html(
                '<i class="fas fa-user-plus me-2"></i>Create Account'
            );
        }, 800);
    }

    /**
     * Show form status message
     * @param {string} message - Message to display
     * @param {string} type - 'success' or 'error'
     */
    function showFormStatus(message, type) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
        const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

        $formStatus.html(`
            <div class="${alertClass}">
                <i class="fas ${iconClass} me-2"></i>${message}
            </div>
        `).fadeIn(200);

        // Auto-hide after 5 seconds
        setTimeout(function() {
            $formStatus.fadeOut(200, function() {
                $(this).empty();
            });
        }, 5000);
    }

    /**
     * Fetch users from API
     * @returns {Promise} jQuery AJAX promise
     */
    function fetchUsers() {
        // Show loading state
        $usersLoading.show();
        $usersTableContainer.hide();
        $usersEmpty.hide();

        return $.ajax({
            url: API_URL,
            method: 'GET',
            success: function(response) {
                if (response.success && response.users.length > 0) {
                    renderUsersTable(response.users);
                    $usersTableContainer.fadeIn(200);
                } else {
                    $usersEmpty.fadeIn(200);
                }
            },
            error: function(xhr) {
                console.error('Failed to fetch users:', xhr);
                $usersEmpty.html(`
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load members. Please try again.</p>
                `).fadeIn(200);
            },
            complete: function() {
                $usersLoading.hide();
            }
        });
    }

    /**
     * Render users table
     * @param {Array} users - Array of user objects
     */
    function renderUsersTable(users) {
        const rows = users.map(user => {
            const date = new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const typeBadge = user.type === 'admin' 
                ? '<span class="user-type-badge admin">Admin</span>'
                : '<span class="user-type-badge user">User</span>';

            const statusBadge = user.active
                ? '<span class="user-status-badge active">Active</span>'
                : '<span class="user-status-badge inactive">Inactive</span>';

            return `
                <tr data-id="${user.userId}">
                    <td><strong>#${user.userId}</strong></td>
                    <td class="user-email">${escapeHtml(user.email)}</td>
                    <td>${typeBadge}</td>
                    <td>${statusBadge}</td>
                    <td class="user-date">${date}</td>
                    <td class="user-actions">
                        <button class="btn btn-sm btn-outline-warning toggle-user-btn" 
                                data-id="${user.userId}" 
                                title="${user.active ? 'Deactivate' : 'Activate'}">
                            <i class="fas fa-power-off"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-user-btn" 
                                data-id="${user.userId}" 
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        $usersTableBody.html(rows);

        // Bind action buttons
        bindActionButtons();
    }

    /**
     * Bind action buttons for each user row
     */
    function bindActionButtons() {
        // Toggle user status
        $('.toggle-user-btn').off('click').on('click', function() {
            const userId = $(this).data('id');
            toggleUserStatus(userId);
        });

        // Delete user
        $('.delete-user-btn').off('click').on('click', function() {
            const userId = $(this).data('id');
            if (confirm('Are you sure you want to delete this user?')) {
                deleteUser(userId);
            }
        });
    }

    /**
     * Toggle user active status
     * @param {number} userId - User ID
     */
    function toggleUserStatus(userId) {
        $.ajax({
            url: `${API_URL}/${userId}/toggle`,
            method: 'PUT',
            success: function() {
                fetchUsers();
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.message || 'Failed to update user');
            }
        });
    }

    /**
     * Delete user
     * @param {number} userId - User ID
     */
    function deleteUser(userId) {
        $.ajax({
            url: `${API_URL}/${userId}`,
            method: 'DELETE',
            success: function() {
                fetchUsers();
            },
            error: function(xhr) {
                alert(xhr.responseJSON?.message || 'Failed to delete user');
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
     * Initialize users module
     */
    function init() {
        cacheElements();
        bindEvents();
        // Static mode: Don't fetch from API, table is pre-populated in HTML
        // fetchUsers(); // Disabled - using static HTML data
        $usersLoading.hide();
        $usersTableContainer.show();
    }

    // Public API
    return {
        init: init,
        fetchUsers: fetchUsers
    };
})();
