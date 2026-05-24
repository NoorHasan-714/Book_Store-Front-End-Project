function togglePassword(inputId, toggleBtnId) {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleBtnId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.innerHTML = '👁️‍🗨️';
        toggleBtn.title = 'Hide password';
    } else {
        passwordInput.type = 'password';
        toggleBtn.innerHTML = '👁️‍🗨️';
        toggleBtn.title = 'Show password';
    }
}