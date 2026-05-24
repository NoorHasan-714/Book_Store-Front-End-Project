// Session and Authentication Management
const AUTH_KEY = 'pkbookstore_auth';
const LOGIN_HISTORY_KEY = 'pkbookstore_login_history';
const USERS_KEY = 'pkbookstore_users';
const USER_HISTORY_KEY = 'pkbookstore_user_history';
const CARTS_KEY = 'pkbookstore_user_carts';

// Check if user is logged in
function checkAuth() {
    const auth = sessionStorage.getItem(AUTH_KEY);
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    
    // Allow access to login and registration pages without auth
    const publicPages = ['loginpage.html', 'registration.html', 'signup.html'];
    const isPublicPage = publicPages.includes(currentPage);
    
    if (!auth && !isPublicPage) {
        alert('Please login or register to access this page.');
        window.location.href = 'LoginPage.html';
        return false;
    }
    
    // Redirect logged-in users away from login/register pages
    if (auth && isPublicPage) {
        window.location.href = 'Home.html';
        return false;
    }
    
    return true;
}

// Login user and store session
function loginUser(username) {
    const loginData = {
        username: username,
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId()
    };
    
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(loginData));
    
    // Store login history in localStorage
    const history = JSON.parse(localStorage.getItem(LOGIN_HISTORY_KEY) || '[]');
    history.push(loginData);
    localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(history));
    
    // Load user's transaction history into session
    const userHistory = getUserHistory(username);
    sessionStorage.setItem(USER_HISTORY_KEY, JSON.stringify(userHistory));
    
    return loginData;
}

// Logout user
function logoutUser() {
    // Clear user's transaction history from session
    sessionStorage.removeItem(USER_HISTORY_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    // Inform the user
    try {
        alert('You have been logged out.');
    } catch (e) {
        // ignore if alert blocked
    }
    window.location.href = 'LoginPage.html';
}

// Get current user's login history
function getLoginHistory() {
    return JSON.parse(localStorage.getItem(LOGIN_HISTORY_KEY) || '[]');
}

// Generate unique session ID
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Register new user and store in localStorage
function registerUser(username, password, email) {
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (users[username]) {
        return { success: false, message: 'Username already exists.' };
    }
    users[username] = {
        username,
        password,
        email,
        registeredAt: new Date().toISOString()
    };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Initialize empty history for new user
    const allHistory = JSON.parse(localStorage.getItem(USER_HISTORY_KEY) || '{}');
    allHistory[username] = {
        booksPurchased: [],
        novelsPurchased: [],
        booksSold: [],
        novelsSold: []
    };
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(allHistory));
    
    return { success: true };
}

// Get user info by username
function getUser(username) {
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    return users[username] || null;
}

// Validate login credentials
function validateLogin(username, password) {
    let user = getUser(username);
    if (!user) return { success: false, message: 'Account not found.' };
    if (user.isDeleted) return { success: false, message: 'This account has been deleted.' };
    return { success: user.password === password, message: user.password === password ? '' : 'Invalid password.' };
}

// Get current user data
function getCurrentUser() {
    const auth = sessionStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth) : null;
}

// Delete user account
function deleteAccount(username) {
    // Get all users
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    
    // Check if user exists
    if (!users[username]) {
        return { success: false, message: 'Account not found.' };
    }
    
    // Mark the account as deleted instead of completely removing it
    users[username].isDeleted = true;
    users[username].deletedAt = new Date().toISOString();
    
    // Save updated users data
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Remove user history
    const allHistory = JSON.parse(localStorage.getItem(USER_HISTORY_KEY) || '{}');
    delete allHistory[username];
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(allHistory));
    
    // Clear session
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(USER_HISTORY_KEY);
    
    return { success: true, message: 'Account successfully deleted.' };
}

// Get user's transaction history
function getUserHistory(username) {
    const allHistory = JSON.parse(localStorage.getItem(USER_HISTORY_KEY) || '{}');
    return allHistory[username] || {
        booksPurchased: [],
        novelsPurchased: [],
        booksSold: [],
        novelsSold: []
    };
}

// Add item to user's history
function addToHistory(type, item) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const allHistory = JSON.parse(localStorage.getItem(USER_HISTORY_KEY) || '{}');
    if (!allHistory[user.username]) {
        allHistory[user.username] = {
            booksPurchased: [],
            novelsPurchased: [],
            booksSold: [],
            novelsSold: []
        };
    }
    
    allHistory[user.username][type].push(item);
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(allHistory));
    
    // Update session storage
    sessionStorage.setItem(USER_HISTORY_KEY, JSON.stringify(allHistory[user.username]));
    
    return true;
}

// --- Cart / Checkout helpers ---
function getAllCarts() {
    return JSON.parse(localStorage.getItem(CARTS_KEY) || '{}');
}

function getUserCart(username) {
    const carts = getAllCarts();
    return carts[username] || [];
}

function saveUserCart(username, cart) {
    const carts = getAllCarts();
    carts[username] = cart;
    localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
    // keep session in sync if current user
    const current = getCurrentUser();
    if (current && current.username === username) {
        sessionStorage.setItem('pkbookstore_user_cart', JSON.stringify(cart));
    }
}

function addToCart(item) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not authenticated' };
    const cart = getUserCart(user.username);
    // item: { id, title, unitPrice, quantity }
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.quantity = (existing.quantity || 0) + (item.quantity || 1);
    } else {
        cart.push(Object.assign({quantity: 1}, item));
    }
    saveUserCart(user.username, cart);
    return { success: true, cart };
}

function updateCartItem(itemId, quantity) {
    const user = getCurrentUser();
    if (!user) return false;
    const cart = getUserCart(user.username);
    const idx = cart.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    if (quantity <= 0) {
        cart.splice(idx, 1);
    } else {
        cart[idx].quantity = quantity;
    }
    saveUserCart(user.username, cart);
    return true;
}

function removeFromCart(itemId) {
    return updateCartItem(itemId, 0);
}

function clearCart(username) {
    const carts = getAllCarts();
    delete carts[username];
    localStorage.setItem(CARTS_KEY, JSON.stringify(carts));
    const current = getCurrentUser();
    if (current && current.username === username) sessionStorage.removeItem('pkbookstore_user_cart');
}

// Checkout: accepts buyerDetails { username, email, address } and moves cart items into purchase history
function checkoutCart(buyerDetails) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not authenticated' };
    const username = user.username;
    const cart = getUserCart(username);
    if (!cart || cart.length === 0) return { success: false, message: 'Cart is empty' };

    // Compute totals and create purchase entries
    const purchaseEntries = cart.map(i => ({
        id: i.id,
        title: i.title,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        total: (i.unitPrice || 0) * (i.quantity || 0),
        purchasedAt: new Date().toISOString(),
        buyer: { username: buyerDetails.username || username, email: buyerDetails.email || getUser(username).email, address: buyerDetails.address || '' }
    }));

    // Add to user's purchased lists (booksPurchased or novelsPurchased) - infer by type if provided
    const allHistory = JSON.parse(localStorage.getItem(USER_HISTORY_KEY) || '{}');
    if (!allHistory[username]) allHistory[username] = { booksPurchased: [], novelsPurchased: [], booksSold: [], novelsSold: [] };
    purchaseEntries.forEach(entry => {
        // default to booksPurchased
        allHistory[username].booksPurchased.push(entry);
    });
    localStorage.setItem(USER_HISTORY_KEY, JSON.stringify(allHistory));
    // Update session
    sessionStorage.setItem(USER_HISTORY_KEY, JSON.stringify(allHistory[username]));

    // Clear cart after checkout
    clearCart(username);

    return { success: true, purchases: purchaseEntries };
}

// Note: navigation button visibility should be handled per-page (e.g. Home.html)