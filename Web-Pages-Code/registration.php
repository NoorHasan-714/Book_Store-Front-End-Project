<!-- /* <?php
// 1. Database Connection Parameters
$servername = "localhost";
$db_username = "root"; // Default XAMPP username
$db_password = "";     // Default XAMPP password (often blank)
$dbname = "pkbookstore";

// 2. Establish Connection
$conn = new mysqli("localhost", "root","", "pkbookstore");

// Check connection
if ($conn->connect_error) {
    // If connection fails, output an error and stop execution
    die("Connection failed: " . $conn->connect_error);
}

// 3. Process Form Submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect and sanitize user input
    $username = $conn->real_escape_string($_POST['username']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = $_POST['password'];

    // 4. Hash the password for secure storage
    // Always use password_hash() for new registrations
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 5. Check if the username or email already exists (Optional but highly recommended)
    $check_stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $check_stmt->bind_param("ss", $username, $email);
    $check_stmt->execute();
    $check_stmt->store_result();

    if ($check_stmt->num_rows > 0) {
        // A user with this username or email already exists
        echo "Error: Username or Email already taken. Please try a different one.";
        $check_stmt->close();
        $conn->close();
        exit();
    }
    $check_stmt->close();

    // 6. Prepare and Execute SQL INSERT Statement
    // Use prepared statements to prevent SQL Injection attacks
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashed_password); // "sss" means three strings

    if ($stmt->execute()) {
        // Success message
        echo "New user registered successfully! Welcome, " . htmlspecialchars($username) . ".";
        
        // Optional: Redirect the user to a login or home page after success
        // header("Location: LoginPage.html");
        // exit(); 
    } else {
        // Failure message
        echo "Error: " . $stmt->error;
    }

    // 7. Close the statement
    $stmt->close();
} else {
    // Handle cases where the script is accessed directly (not via POST submission)
    echo "Access Denied: This script should be accessed via the registration form.";
}

// 8. Close the connection
$conn->close();

?>  -->



<?php
/**
 * PHP script to handle user registration, connect to the 'pkbookstore' database,
 * hash the password, and insert the user data.
 */

// 1. Database Connection Parameters
$servername = "localhost";
$db_username = "root";   // Default XAMPP username
$db_password = "";       // Default XAMPP password (often blank, adjust if you set one)
$dbname = "pkbookstore"; // Database name

// 2. Establish Connection
// Create a new MySQLi object to connect to the database
$conn = new mysqli($servername, $db_username, $db_password, $dbname);

// Check for connection errors
if ($conn->connect_error) {
    // Stop execution if the connection fails and display the error
    die("Database Connection failed: " . $conn->connect_error);
}

// 3. Process Form Submission (Only if the request method is POST)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Retrieve and sanitize user input from the HTML form
    // mysqli::real_escape_string is used for basic sanitation
    $username = $conn->real_escape_string($_POST['username']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = $_POST['password']; // Password is used as-is before hashing

    // Basic server-side validation
    if (empty($username) || empty($email) || empty($password)) {
        echo "Error: All fields are required.";
        $conn->close();
        exit();
    }

    // 4. Hash the password
    // Use password_hash() for security. It's crucial for protecting user data.
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 5. Check if the username or email already exists (Security check)
    $check_stmt = $conn->prepare("SELECT user_id FROM users WHERE username = ? OR email = ?");
    $check_stmt->bind_param("ss", $username, $email);
    $check_stmt->execute();
    $check_stmt->store_result();

    if ($check_stmt->num_rows > 0) {
        // A user with this username or email already exists
        echo "Error: Username or Email already exists. Please try a different one.";
        $check_stmt->close();
        $conn->close();
        exit();
    }
    $check_stmt->close();

    // 6. Prepare and Execute SQL INSERT Statement
    // Use prepared statements for security against SQL Injection
    $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    
    // "sss" means the three parameters being bound are strings
    $stmt->bind_param("sss", $username, $email, $hashed_password);

    if ($stmt->execute()) {
        // Registration successful
        echo "🎉 Success! Account created for **" . htmlspecialchars($username) . "**! Your data has been saved to the 'pkbookstore' database.";
        
        // --- IMPORTANT: Redirection Logic ---
        // Since your frontend JS does a redirect, you should coordinate.
        // If you remove the JS 'e.preventDefault()' and rely only on PHP,
        // you would use a header redirect here:
        // header("Location: LoginPage.html?registration=success");
        // exit(); 
    } else {
        // Error during insertion
        echo "Error inserting data: " . $stmt->error;
    }

    // 7. Close the statement
    $stmt->close();
} else {
    // If someone accesses this file directly via URL
    echo "Access Denied. Please submit the form to register.";
}

// 8. Close the database connection
$conn->close();
?>