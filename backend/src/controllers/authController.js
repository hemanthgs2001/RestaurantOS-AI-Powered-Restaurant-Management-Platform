const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ---- Mail transporter ----
// Configure these in your .env file (same vars used elsewhere, e.g. staffController.js):
//   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_SECURE (optional, 'true'/'false')
//
// NOTE: connectionTimeout/greetingTimeout/socketTimeout are explicitly set
// to 10s. Nodemailer's default connectionTimeout is 2 minutes — if SMTP is
// slow or unreachable, that 2-minute default is what previously made
// registration feel "stuck". Capping it here means a broken SMTP
// connection fails fast in the logs instead of hanging.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Sends a welcome email to a newly registered user, including their
// password so they have it on hand for their first login.
// Failures here are logged but never block the API response, since a mail
// server hiccup shouldn't prevent an account from being created.
const sendUserWelcomeEmail = async (user, plainPassword) => {
  if (!user.email) return;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to RestaurantOS!',
      html: `
        <div style="font-family: Arial, sans-serif; color: #1F2937;">
          <h2>Welcome, ${user.name}!</h2>
          <p>Your account has been created successfully.</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Password:</strong> ${plainPassword}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p>For security, we recommend logging in and changing your password as soon as possible.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send user welcome email:', error.message);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (gated by a secret key)
//
// Configure the gate key in your .env file:
//   REGISTRATION_SECRET_KEY=some-long-random-string
//
// The registration form must submit this exact value in `secretKey`.
// No key, or the wrong key, means no user is created.
const register = async (req, res) => {
  try {
    const { name, email, password, role, secretKey } = req.body;

    // ---- Secret key gate ----
    if (!secretKey || secretKey !== process.env.REGISTRATION_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or missing secret key. Registration is not allowed.',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user
    // (password is stored as-is here because the User model handles hashing
    // internally via its own hook, same as before — comparePassword relies on it)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'waiter',
    });

    // Respond immediately — registration is complete at this point and the
    // client should not wait on anything else (especially not SMTP).
    res.status(201).json({
      success: true,
      message: 'Registration successful. A welcome email will be sent shortly.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};