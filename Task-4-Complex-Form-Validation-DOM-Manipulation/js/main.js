document.addEventListener('DOMContentLoaded', () => {
  // --- STATE MANAGER ---
  let users = JSON.parse(localStorage.getItem('registered_users')) || [];

  // --- DOM ELEMENTS REFERENCE ---
  const sections = document.querySelectorAll('.app-section');
  const navLinks = document.querySelectorAll('.nav-link-custom');
  
  // Form elements
  const regForm = document.getElementById('registrationForm');
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const dob = document.getElementById('dob');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
  
  // Strength meter elements
  const strengthMeterFill = document.getElementById('strengthMeterFill');
  const strengthText = document.getElementById('strengthText');
  
  // Submit btn
  const submitBtn = document.getElementById('submitBtn');

  // Stats elements
  const userCountStat = document.getElementById('userCountStat');
  const activeUsersStat = document.getElementById('activeUsersStat');

  // Dashboard users list elements
  const usersGrid = document.getElementById('usersGrid');
  const searchUser = document.getElementById('searchUser');
  const clearUsersBtn = document.getElementById('clearUsersBtn');

  // Toast notification
  const customToast = document.getElementById('customToast');
  const toastMessage = document.getElementById('toastMessage');

  // --- CLIENT-SIDE ROUTING ---
  function handleRouting() {
    const hash = window.location.hash || '#home';
    
    // Hide all sections, remove active class
    sections.forEach(sec => {
      sec.classList.remove('active');
    });

    // Remove active class from all nav links
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      }
    });

    // Show current active section
    const activeSection = document.querySelector(hash);
    if (activeSection) {
      activeSection.classList.add('active');
    } else {
      // Fallback
      document.querySelector('#home').classList.add('active');
      window.location.hash = '#home';
    }

    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close Bootstrap mobile navbar if open
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show') && typeof bootstrap !== 'undefined') {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }

    // Refresh display details when entering list section
    if (hash === '#users') {
      renderUsersList();
    }
    
    // Always update home stats count
    updateStats();
  }

  window.addEventListener('hashchange', handleRouting);
  // Initial routing
  handleRouting();

  // --- PASSWORD VISIBILITY TOGGLE ---
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = password.getAttribute('type') === 'password';
      password.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordBtn.innerHTML = isPassword ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    });
  }

  if (toggleConfirmPasswordBtn) {
    toggleConfirmPasswordBtn.addEventListener('click', () => {
      const isPassword = confirmPassword.getAttribute('type') === 'password';
      confirmPassword.setAttribute('type', isPassword ? 'text' : 'password');
      toggleConfirmPasswordBtn.innerHTML = isPassword ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    });
  }

  // --- NOTIFICATION TOAST WRAPPER ---
  function showToast(message, isError = false) {
    toastMessage.textContent = message;
    if (isError) {
      customToast.style.background = 'rgba(239, 68, 68, 0.95)';
    } else {
      customToast.style.background = 'rgba(16, 185, 129, 0.95)';
    }
    customToast.classList.add('show');
    setTimeout(() => {
      customToast.classList.remove('show');
    }, 4000);
  }

  // --- STATS COUNT UPDATE ---
  function updateStats() {
    if (userCountStat) {
      userCountStat.textContent = users.length;
    }
    if (activeUsersStat) {
      // We can mock this to represent the number of users created in this browser session
      activeUsersStat.textContent = users.length > 0 ? users.length : 0;
    }
  }

  // --- REAL-TIME VALIDATION RULES ---

  // 1. Name Validation (Min 2 chars, letters & spaces only)
  function validateName() {
    const value = fullName.value.trim();
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    
    if (value === "") {
      setError(fullName, "Full Name is required.");
      return false;
    } else if (!nameRegex.test(value)) {
      setError(fullName, "Name must be at least 2 characters and contain only letters.");
      return false;
    } else {
      setSuccess(fullName);
      return true;
    }
  }

  // 2. Email Validation
  function validateEmail() {
    const value = email.value.trim();
    // Standard robust regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (value === "") {
      setError(email, "Email Address is required.");
      return false;
    } else if (!emailRegex.test(value)) {
      setError(email, "Please enter a valid email address.");
      return false;
    } else {
      setSuccess(email);
      return true;
    }
  }

  // 3. Phone Number Validation (Exactly 10 digits)
  function validatePhone() {
    const value = phone.value.trim();
    const phoneRegex = /^\d{10}$/;

    if (value === "") {
      setError(phone, "Phone Number is required.");
      return false;
    } else if (!phoneRegex.test(value)) {
      setError(phone, "Phone number must be exactly 10 digits.");
      return false;
    } else {
      setSuccess(phone);
      return true;
    }
  }

  // 4. Age Validation (18+)
  function validateAge() {
    const value = dob.value;
    if (value === "") {
      setError(dob, "Date of Birth is required.");
      return false;
    }

    const dobDate = new Date(value);
    const today = new Date();
    
    // Check if input date is in the future
    if (dobDate > today) {
      setError(dob, "Date of Birth cannot be in the future.");
      return false;
    }

    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError(dob, `You must be at least 18 years old. (Current Age: ${age})`);
      return false;
    } else {
      setSuccess(dob);
      return true;
    }
  }

  // 5. Password Strength Meter & Validation
  function checkPasswordStrength() {
    const value = password.value;
    let score = 0;
    
    if (value.length === 0) {
      strengthMeterFill.style.width = '0%';
      strengthMeterFill.style.backgroundColor = 'transparent';
      strengthText.textContent = '';
      setError(password, "Password is required.");
      return 0;
    }

    // Heuristics
    if (value.length >= 8) score++;
    if (/[a-z]/.test(value)) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^a-zA-Z\d]/.test(value)) score++;

    // Update Strength Indicator visual styling
    let strength = "Weak";
    let color = "#ef4444"; // Red
    let width = "33%";

    if (score >= 5) {
      strength = "Strong";
      color = "#10b981"; // Emerald Green
      width = "100%";
    } else if (score >= 3) {
      strength = "Medium";
      color = "#f59e0b"; // Orange/Amber
      width = "66%";
    }

    strengthMeterFill.style.width = width;
    strengthMeterFill.style.backgroundColor = color;
    strengthText.textContent = `Strength: ${strength}`;
    strengthText.style.color = color;

    // Validate overall password
    if (value.length < 8) {
      setError(password, "Password must be at least 8 characters long.");
      return score;
    } else if (score < 3) {
      setError(password, "Password is too weak. Add capitals, numbers, or symbols.");
      return score;
    } else {
      setSuccess(password);
      return score;
    }
  }

  // 6. Confirm Password Validation
  function validateConfirmPassword() {
    const passValue = password.value;
    const confirmValue = confirmPassword.value;

    if (confirmValue === "") {
      setError(confirmPassword, "Please confirm your password.");
      return false;
    } else if (passValue !== confirmValue) {
      setError(confirmPassword, "Passwords do not match.");
      return false;
    } else {
      setSuccess(confirmPassword);
      return true;
    }
  }

  // Helper validation feedback setters
  function setError(inputElement, msg) {
    inputElement.classList.remove('is-valid-field');
    inputElement.classList.add('is-invalid-field');
    
    const feedbackEl = document.getElementById(`${inputElement.id}Feedback`);
    if (feedbackEl) {
      feedbackEl.textContent = msg;
      feedbackEl.style.color = 'var(--color-danger)';
    }
  }

  function setSuccess(inputElement) {
    inputElement.classList.remove('is-invalid-field');
    inputElement.classList.add('is-valid-field');
    
    const feedbackEl = document.getElementById(`${inputElement.id}Feedback`);
    if (feedbackEl) {
      feedbackEl.textContent = "Looks good!";
      feedbackEl.style.color = 'var(--color-success)';
    }
  }

  // Remove styling on empty resetting
  function clearValidationStyle(inputElement) {
    inputElement.classList.remove('is-valid-field', 'is-invalid-field');
    const feedbackEl = document.getElementById(`${inputElement.id}Feedback`);
    if (feedbackEl) {
      feedbackEl.textContent = "";
    }
  }

  // Bind key up / blur events for real-time response
  fullName.addEventListener('input', validateName);
  fullName.addEventListener('blur', validateName);

  email.addEventListener('input', validateEmail);
  email.addEventListener('blur', validateEmail);

  phone.addEventListener('input', validatePhone);
  phone.addEventListener('blur', validatePhone);

  dob.addEventListener('input', validateAge);
  dob.addEventListener('blur', validateAge);

  password.addEventListener('input', () => {
    checkPasswordStrength();
    if (confirmPassword.value !== "") {
      validateConfirmPassword();
    }
  });
  password.addEventListener('blur', checkPasswordStrength);

  confirmPassword.addEventListener('input', validateConfirmPassword);
  confirmPassword.addEventListener('blur', validateConfirmPassword);

  // Dynamic status evaluation to enable/disable submit button (optional extra touch)
  function checkFormValidity() {
    const isNameValid = /^[a-zA-Z\s]{2,50}$/.test(fullName.value.trim());
    const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value.trim());
    const isPhoneValid = /^\d{10}$/.test(phone.value.trim());
    
    // Age check
    let isAgeValid = false;
    if (dob.value !== "") {
      const dobDate = new Date(dob.value);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        age--;
      }
      isAgeValid = age >= 18 && dobDate <= today;
    }

    // Password score evaluation
    const passVal = password.value;
    let score = 0;
    if (passVal.length >= 8) score++;
    if (/[a-z]/.test(passVal)) score++;
    if (/[A-Z]/.test(passVal)) score++;
    if (/\d/.test(passVal)) score++;
    if (/[^a-zA-Z\d]/.test(passVal)) score++;

    const isPasswordValid = passVal.length >= 8 && score >= 3;
    const isConfirmValid = passVal === confirmPassword.value && confirmPassword.value !== "";

    return isNameValid && isEmailValid && isPhoneValid && isAgeValid && isPasswordValid && isConfirmValid;
  }

  // Add checking to keyup on form to dynamically color button
  regForm.addEventListener('keyup', () => {
    if (checkFormValidity()) {
      submitBtn.classList.add('shadow-pulse'); // visual flourish
    } else {
      submitBtn.classList.remove('shadow-pulse');
    }
  });

  // --- SUBMISSION PROCESS ---
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Trigger full check explicitly
    const isNValid = validateName();
    const isEValid = validateEmail();
    const isPValid = validatePhone();
    const isAValid = validateAge();
    const score = checkPasswordStrength();
    const isPassValid = password.value.length >= 8 && score >= 3;
    const isCValid = validateConfirmPassword();

    if (isNValid && isEValid && isPValid && isAValid && isPassValid && isCValid) {
      // Calculate age for displaying
      const dobVal = new Date(dob.value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - dobVal.getFullYear();
      const monthDiff = today.getMonth() - dobVal.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobVal.getDate())) {
        calculatedAge--;
      }

      // Collect data (Password is hashed in a standard app, here we store length/masked value to keep it secure on screen)
      const newUser = {
        id: 'usr_' + Date.now(),
        name: fullName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        dob: dob.value,
        age: calculatedAge,
        registeredAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Push and save
      users.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(users));

      // Show toast
      showToast(`Account created for ${newUser.name}!`);

      // Reset form
      regForm.reset();
      clearValidationStyle(fullName);
      clearValidationStyle(email);
      clearValidationStyle(phone);
      clearValidationStyle(dob);
      clearValidationStyle(password);
      clearValidationStyle(confirmPassword);

      // Reset password meter
      strengthMeterFill.style.width = '0%';
      strengthText.textContent = '';

      // Direct user to submitted list section
      setTimeout(() => {
        window.location.hash = '#users';
      }, 800);

    } else {
      showToast("Please fix the validation errors before submitting.", true);
    }
  });

  // --- DYNAMIC RENDERING (USERS LIST) ---
  function renderUsersList() {
    if (!usersGrid) return;
    
    // Clear the current elements
    usersGrid.innerHTML = '';
    
    const searchQuery = searchUser.value.trim().toLowerCase();
    
    // Filter matching users
    const filteredUsers = users.filter(usr => {
      return usr.name.toLowerCase().includes(searchQuery) || 
             usr.email.toLowerCase().includes(searchQuery) ||
             usr.phone.includes(searchQuery);
    });

    if (filteredUsers.length === 0) {
      usersGrid.innerHTML = `
        <div class="col-12">
          <div class="empty-state glass-card p-5">
            <i class="bi bi-people"></i>
            <h3>No Registered Users Found</h3>
            <p class="text-muted">
              ${searchQuery ? "No results match your search query." : "Register your first user to display their information here."}
            </p>
            ${!searchQuery ? '<a href="#register" class="btn btn-primary-custom mt-3">Register Now</a>' : ''}
          </div>
        </div>
      `;
      return;
    }

    filteredUsers.forEach(usr => {
      const cardCol = document.createElement('div');
      cardCol.className = 'col-md-6 col-lg-4 mb-4';
      cardCol.id = usr.id;
      
      // Get initials for avatar
      const initials = usr.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);

      cardCol.innerHTML = `
        <div class="glass-card user-card p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center mb-3">
              <div class="user-avatar">${initials}</div>
              <div style="overflow: hidden;">
                <h5 class="mb-0 text-truncate" title="${usr.name}">${usr.name}</h5>
                <span class="badge bg-indigo-subtle text-indigo" style="font-size: 0.75rem; background: rgba(99, 102, 241, 0.25); color: #818cf8;">
                  Age: ${usr.age}
                </span>
              </div>
            </div>
            
            <div class="user-detail-row text-truncate" title="${usr.email}">
              <i class="bi bi-envelope-fill"></i>
              <span>${usr.email}</span>
            </div>
            <div class="user-detail-row">
              <i class="bi bi-telephone-fill"></i>
              <span>${usr.phone}</span>
            </div>
            <div class="user-detail-row">
              <i class="bi bi-calendar-event"></i>
              <span>DOB: ${new Date(usr.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          
          <div class="border-top border-secondary-subtle pt-3 mt-3 d-flex align-items-center justify-content-between">
            <small class="text-muted" style="font-size: 0.75rem;">Registered: <br>${usr.registeredAt}</small>
            <button class="user-delete-btn btn btn-sm" data-id="${usr.id}">
              <i class="bi bi-trash-fill me-1"></i> Delete
            </button>
          </div>
        </div>
      `;

      usersGrid.appendChild(cardCol);
    });

    // Attach deletion handlers to the freshly rendered cards
    const deleteButtons = usersGrid.querySelectorAll('.user-delete-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = btn.getAttribute('data-id');
        deleteUser(userId);
      });
    });
  }

  // Search input change handler
  if (searchUser) {
    searchUser.addEventListener('input', renderUsersList);
  }

  // --- DELETE USER ACTION ---
  function deleteUser(id) {
    const cardElement = document.getElementById(id);
    if (!cardElement) return;

    // Apply fade out animation style
    cardElement.classList.add('fade-out-card');

    // Remove from memory/storage and DOM after transition completes
    setTimeout(() => {
      users = users.filter(usr => usr.id !== id);
      localStorage.setItem('registered_users', JSON.stringify(users));
      
      // Update stats and re-render grid
      updateStats();
      renderUsersList();
      showToast("User record deleted successfully.");
    }, 300);
  }

  // --- CLEAR ALL USERS ACTION ---
  if (clearUsersBtn) {
    clearUsersBtn.addEventListener('click', () => {
      if (users.length === 0) return;
      
      if (confirm("Are you sure you want to delete all registered users? This action cannot be undone.")) {
        // Add fade out to all child elements
        const children = usersGrid.children;
        for (let i = 0; i < children.length; i++) {
          children[i].classList.add('fade-out-card');
        }
        
        setTimeout(() => {
          users = [];
          localStorage.removeItem('registered_users');
          updateStats();
          renderUsersList();
          showToast("All registered user records cleared.");
        }, 300);
      }
    });
  }
});
