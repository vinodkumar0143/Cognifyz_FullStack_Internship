/**
 * Task 5: API Integration & Front-End Interaction
 * app.js - Client-Side Controller & REST Fetch Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let users = [];
    let deleteTargetId = null;

    // --- DOM CACHE ---
    // Grids & States
    const usersGrid = document.getElementById('usersGrid');
    const skeletonLoader = document.getElementById('skeletonLoader');
    const emptyState = document.getElementById('emptyState');
    const searchBar = document.getElementById('searchBar');

    // Counters
    const countTotal = document.getElementById('countTotal');
    const countActive = document.getElementById('countActive');
    const countSuspended = document.getElementById('countSuspended');
    const countAvgAge = document.getElementById('countAvgAge');

    // Modals & Buttons
    const openAddModalBtn = document.getElementById('openAddModalBtn');
    const userModal = document.getElementById('userModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const userForm = document.getElementById('userForm');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const modalTitle = document.getElementById('modalTitle');

    // Profile Drawer Modal
    const viewModal = document.getElementById('viewModal');
    const closeViewBtn = document.getElementById('closeViewBtn');
    const closeViewFooterBtn = document.getElementById('closeViewFooterBtn');

    // Delete Modal
    const deleteModal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const deleteTargetName = document.getElementById('deleteTargetName');

    // Toast Container
    const toastContainer = document.getElementById('toastContainer');

    // Form Fields
    const fieldId = document.getElementById('userId');
    const fieldFullName = document.getElementById('fullName');
    const fieldEmail = document.getElementById('email');
    const fieldPhone = document.getElementById('phone');
    const fieldDob = document.getElementById('dob');
    const fieldRole = document.getElementById('role');
    const fieldStatus = document.getElementById('status');

    // --- INITIALIZATION ---
    fetchUsers();

    // --- EVENT LISTENERS ---
    // Search Filter
    searchBar.addEventListener('input', () => {
        renderUsers(searchBar.value);
    });

    // Add User Modal Trigger
    openAddModalBtn.addEventListener('click', () => {
        openModal(false);
    });

    // Close Modals
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) closeModal();
    });

    // Form Submission
    userForm.addEventListener('submit', handleFormSubmit);

    // Profile Details Close
    closeViewBtn.addEventListener('click', closeViewModal);
    closeViewFooterBtn.addEventListener('click', closeViewModal);
    viewModal.addEventListener('click', (e) => {
        if (e.target === viewModal) closeViewModal();
    });

    // Delete Close & Confirm
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    // Real-time Input Validation Listeners
    setupInputValidation();

    // --- CORE CONTROLLER FUNCTIONS ---

    // 1. Fetch Users List
    async function fetchUsers() {
        showLoader(true);
        try {
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to retrieve user directory.');
            users = await response.ok ? await response.json() : [];
            renderUsers(searchBar.value);
            updateStats();
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
            showEmptyState(true);
        } finally {
            showLoader(false);
        }
    }

    // 2. Render Users Grid
    function renderUsers(keyword = '') {
        usersGrid.innerHTML = '';
        const cleanKeyword = keyword.trim().toLowerCase();

        const filtered = users.filter(user => {
            return (
                user.fullName.toLowerCase().includes(cleanKeyword) ||
                user.email.toLowerCase().includes(cleanKeyword) ||
                user.role.toLowerCase().includes(cleanKeyword) ||
                user.phone.includes(cleanKeyword)
            );
        });

        if (filtered.length === 0) {
            showEmptyState(true);
            return;
        }

        showEmptyState(false);

        filtered.forEach(user => {
            const card = document.createElement('article');
            card.className = 'user-card';
            
            // Generate Avatar Initials
            const initials = user.fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

            const isSuspended = user.status === 'Suspended';
            const badgeClass = isSuspended ? 'badge-suspended' : 'badge-active';
            const formattedDob = formatDate(user.dob);

            card.innerHTML = `
                <div class="card-header-block">
                    <div class="user-info-group">
                        <div class="avatar-md">${initials}</div>
                        <div class="user-names">
                            <h3>${escapeHtml(user.fullName)}</h3>
                            <span class="user-role-lbl">${user.role}</span>
                        </div>
                    </div>
                    <span class="badge ${badgeClass}">${user.status}</span>
                </div>
                <div class="card-details">
                    <div class="card-detail-row">
                        <i class="fa-solid fa-envelope"></i>
                        <span>${escapeHtml(user.email)}</span>
                    </div>
                    <div class="card-detail-row">
                        <i class="fa-solid fa-phone"></i>
                        <span>${escapeHtml(user.phone)}</span>
                    </div>
                    <div class="card-detail-row">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span>${formattedDob}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button type="button" class="btn btn-secondary btn-icon view-btn" data-id="${user.id}" title="View profile">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button type="button" class="btn btn-secondary btn-icon edit-btn" data-id="${user.id}" title="Edit profile">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button type="button" class="btn btn-secondary btn-icon delete-btn" data-id="${user.id}" title="Delete profile">
                        <i class="fa-solid fa-trash-can" style="color: var(--red);"></i>
                    </button>
                </div>
            `;

            // Attach dynamic action listeners
            card.querySelector('.view-btn').addEventListener('click', () => viewProfile(user.id));
            card.querySelector('.edit-btn').addEventListener('click', () => openModal(true, user));
            card.querySelector('.delete-btn').addEventListener('click', () => openDeleteModal(user));

            usersGrid.appendChild(card);
        });
    }

    // 3. Update Statistics
    function updateStats() {
        countTotal.textContent = users.length;
        
        const activeCount = users.filter(u => u.status === 'Active').length;
        countActive.textContent = activeCount;
        countSuspended.textContent = users.length - activeCount;

        // Calculate Average Age
        if (users.length === 0) {
            countAvgAge.textContent = '0';
            return;
        }

        const totalAge = users.reduce((sum, user) => {
            return sum + calculateAge(user.dob);
        }, 0);

        countAvgAge.textContent = Math.round(totalAge / users.length);
    }

    // 4. Handle Create / Update Submission
    async function handleFormSubmit(e) {
        e.preventDefault();

        // Validate Form client-side
        const validation = validateForm();
        if (!validation.isValid) return;

        // Show Button loading state
        setBtnLoading(saveUserBtn, true);

        const id = fieldId.value;
        const url = id ? `/api/users/${id}` : '/api/users';
        const method = id ? 'PUT' : 'POST';

        const payload = {
            fullName: fieldFullName.value,
            email: fieldEmail.value,
            phone: fieldPhone.value,
            dob: fieldDob.value,
            role: fieldRole.value,
            status: fieldStatus.value
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                // If API returned server-side validation error map
                if (data.errors) {
                    displayServerErrors(data.errors);
                    throw new Error('Please correct the validation errors.');
                }
                throw new Error(data.message || 'API request failed.');
            }

            showToast(
                id ? 'User profile updated successfully.' : 'New user registered successfully.',
                'success'
            );
            closeModal();
            fetchUsers();
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setBtnLoading(saveUserBtn, false);
        }
    }

    // 5. Handle Delete
    async function handleDeleteConfirm() {
        if (!deleteTargetId) return;

        setBtnLoading(confirmDeleteBtn, true);
        try {
            const response = await fetch(`/api/users/${deleteTargetId}`, {
                method: 'DELETE'
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Failed to delete user.');

            showToast('User profile deleted successfully.', 'success');
            closeDeleteModal();
            fetchUsers();
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        } finally {
            setBtnLoading(confirmDeleteBtn, false);
        }
    }

    // 6. View Profile Drawer fetch
    async function viewProfile(id) {
        try {
            const response = await fetch(`/api/users/${id}`);
            if (!response.ok) throw new Error('Could not fetch profile details.');
            const user = await response.json();

            // Populate view card
            const initials = user.fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

            document.getElementById('viewAvatar').textContent = initials;
            document.getElementById('viewFullName').textContent = user.fullName;
            
            const badge = document.getElementById('viewBadgeStatus');
            badge.className = `badge ${user.status === 'Suspended' ? 'badge-suspended' : 'badge-active'}`;
            badge.textContent = user.status;

            document.getElementById('viewEmail').textContent = user.email;
            document.getElementById('viewPhone').textContent = user.phone;
            
            const age = calculateAge(user.dob);
            document.getElementById('viewDob').textContent = `${formatDate(user.dob)} (Age: ${age})`;
            document.getElementById('viewRole').textContent = user.role;
            
            const regDate = new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            document.getElementById('viewCreatedAt').textContent = regDate;

            // Show modal
            viewModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } catch (err) {
            console.error(err);
            showToast(err.message, 'error');
        }
    }

    // --- MODAL TRIGGERS & ACTIONS ---

    function openModal(isEditMode = false, user = null) {
        resetFormErrors();
        userForm.reset();

        if (isEditMode && user) {
            modalTitle.textContent = 'Edit Corporate Profile';
            fieldId.value = user.id;
            fieldFullName.value = user.fullName;
            fieldEmail.value = user.email;
            fieldPhone.value = user.phone;
            fieldDob.value = user.dob;
            fieldRole.value = user.role;
            fieldStatus.value = user.status;
        } else {
            modalTitle.textContent = 'Register New Account';
            fieldId.value = '';
            fieldStatus.value = 'Active';
        }

        userModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        userModal.classList.add('hidden');
        document.body.style.overflow = '';
        userForm.reset();
        resetFormErrors();
    }

    function closeViewModal() {
        viewModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    function openDeleteModal(user) {
        deleteTargetId = user.id;
        deleteTargetName.textContent = user.fullName;
        deleteModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeDeleteModal() {
        deleteModal.classList.add('hidden');
        document.body.style.overflow = '';
        deleteTargetId = null;
    }

    // --- FORM VALIDATION UTILITIES ---

    function setupInputValidation() {
        const rules = [
            { field: fieldFullName, validator: validateName },
            { field: fieldEmail, validator: validateEmail },
            { field: fieldPhone, validator: validatePhone },
            { field: fieldDob, validator: validateDob },
            { field: fieldRole, validator: validateRole },
            { field: fieldStatus, validator: validateStatus }
        ];

        rules.forEach(rule => {
            // Live validation on blur and input change
            ['input', 'blur'].forEach(eventType => {
                rule.field.addEventListener(eventType, () => {
                    const result = rule.validator(rule.field.value);
                    setFieldState(rule.field, result.isValid, result.message);
                });
            });
        });
    }

    function validateForm() {
        const vName = validateName(fieldFullName.value);
        const vEmail = validateEmail(fieldEmail.value);
        const vPhone = validatePhone(fieldPhone.value);
        const vDob = validateDob(fieldDob.value);
        const vRole = validateRole(fieldRole.value);
        const vStatus = validateStatus(fieldStatus.value);

        setFieldState(fieldFullName, vName.isValid, vName.message);
        setFieldState(fieldEmail, vEmail.isValid, vEmail.message);
        setFieldState(fieldPhone, vPhone.isValid, vPhone.message);
        setFieldState(fieldDob, vDob.isValid, vDob.message);
        setFieldState(fieldRole, vRole.isValid, vRole.message);
        setFieldState(fieldStatus, vStatus.isValid, vStatus.message);

        return {
            isValid: vName.isValid && vEmail.isValid && vPhone.isValid && vDob.isValid && vRole.isValid && vStatus.isValid
        };
    }

    function validateName(val) {
        if (!val || val.trim().length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters.' };
        }
        if (!/^[a-zA-Z\s]+$/.test(val.trim())) {
            return { isValid: false, message: 'Name can only contain letters and spaces.' };
        }
        return { isValid: true, message: '' };
    }

    function validateEmail(val) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val || !emailRegex.test(val.trim())) {
            return { isValid: false, message: 'Enter a valid email address.' };
        }
        return { isValid: true, message: '' };
    }

    function validatePhone(val) {
        if (!val || !/^\d{10}$/.test(val.trim())) {
            return { isValid: false, message: 'Phone must be exactly 10 digits.' };
        }
        return { isValid: true, message: '' };
    }

    function validateDob(val) {
        if (!val) {
            return { isValid: false, message: 'Birthdate is required.' };
        }
        const age = calculateAge(val);
        if (isNaN(age) || age < 18) {
            return { isValid: false, message: `Must be at least 18 years old. (Current: ${isNaN(age) ? 0 : age})` };
        }
        return { isValid: true, message: '' };
    }

    function validateRole(val) {
        if (!val) {
            return { isValid: false, message: 'Please select a job role.' };
        }
        return { isValid: true, message: '' };
    }

    function validateStatus(val) {
        if (!val) {
            return { isValid: false, message: 'Status is required.' };
        }
        return { isValid: true, message: '' };
    }

    function setFieldState(field, isValid, message) {
        const group = field.closest('.form-group');
        const errorSpan = group.querySelector('.error-msg');

        if (isValid) {
            group.classList.remove('invalid');
            errorSpan.textContent = '';
        } else {
            group.classList.add('invalid');
            errorSpan.textContent = message;
        }
    }

    function displayServerErrors(errorMap) {
        Object.keys(errorMap).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                setFieldState(field, false, errorMap[key]);
            }
        });
    }

    function resetFormErrors() {
        const groups = userForm.querySelectorAll('.form-group');
        groups.forEach(g => {
            g.classList.remove('invalid');
            const err = g.querySelector('.error-msg');
            if (err) err.textContent = '';
        });
    }

    // --- OTHER HELPERS ---

    function showLoader(show) {
        if (show) {
            skeletonLoader.classList.remove('hidden');
            usersGrid.classList.add('hidden');
        } else {
            skeletonLoader.classList.add('hidden');
            usersGrid.classList.remove('hidden');
        }
    }

    function showEmptyState(show) {
        if (show) {
            emptyState.classList.remove('hidden');
            usersGrid.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            usersGrid.classList.remove('hidden');
        }
    }

    function setBtnLoading(btn, isLoading) {
        const spinner = btn.querySelector('.btn-spinner');
        const text = btn.querySelector('.btn-text');

        if (isLoading) {
            btn.disabled = true;
            if (spinner) spinner.classList.remove('hidden');
            if (text) text.classList.add('hidden');
        } else {
            btn.disabled = false;
            if (spinner) spinner.classList.add('hidden');
            if (text) text.classList.remove('hidden');
        }
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation';

        toast.innerHTML = `
            <i class="${icon} toast-icon"></i>
            <span class="toast-message">${escapeHtml(message)}</span>
        `;

        toastContainer.appendChild(toast);

        // Auto remove toast
        setTimeout(() => {
            toast.classList.add('removing');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }

    function calculateAge(dobString) {
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
