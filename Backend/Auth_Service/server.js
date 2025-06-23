const express = require('express');
const app = express();
const admin = require("firebase-admin");
const credentials = require("./liffile-auth-service.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials)
});

// Add CORS middleware to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// User login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // In a real implementation, you would verify the user with Firebase Auth
        // For now, we'll just check if the user exists
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            
            // In a real implementation, you'd verify the password here
            // Since we can't verify passwords directly with Admin SDK,
            // we're just checking if the user exists
            
            res.json({
                status: 'success',
                message: 'Login successful',
                data: {
                    uid: userRecord.uid,
                    email: userRecord.email
                }
            });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                res.status(401).json({
                    status: 'failed',
                    message: 'Invalid email or password'
                });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            status: 'failed',
            message: 'Authentication failed'
        });
    }
});

// User signup endpoint
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userResponse = await admin.auth().createUser({
            email,
            password,
            emailVerified: false,
            disabled: false
        });
        res.json({
            status: 'success',
            message: 'User created successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(400).json({
            status: 'failed',
            message: error.message || 'User creation failed'
        });
    }
});

app.listen(8080, '0.0.0.0', () => {
  console.log(`Auth Service is running on port 8080`);
});
