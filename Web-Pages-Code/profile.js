// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return; // Redirects to login if not authenticated
    }

    const user = getCurrentUser();
    const loginHistory = getLoginHistory();
    
    // Display user info
    document.getElementById('username-display').textContent = user.username;
    
    // Display login history
    const historyList = document.getElementById('login-history');
    loginHistory.reverse().forEach(login => {
        const date = new Date(login.timestamp);
        const listItem = document.createElement('li');
        listItem.className = 'login-record';
        listItem.innerHTML = `
            <span class="login-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
            <span class="login-device">${login.sessionId}</span>
        `;
        historyList.appendChild(listItem);
    });
});