const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Login rate limiting
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // limit each IP to 3 login attempts per windowMs
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Validation rules
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Введите корректный email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов')
];

const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя должно содержать от 2 до 50 символов'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Введите корректный email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль должен содержать минимум 6 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Пароль должен содержать буквы и цифры'),
    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('Неверный формат телефона')
];

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authLimiter, registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                message: 'Пользователь с таким email уже существует'
            });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            phone
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при регистрации'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email).select('+password');
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Неверный email или пароль'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({
                error: 'Account locked',
                message: 'Аккаунт заблокирован из-за множественных неудачных попыток входа'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Increment login attempts
            await user.incLoginAttempts();
            
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Неверный email или пароль'
            });
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Успешный вход',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при входе'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при получении профиля'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Имя должно содержать от 2 до 50 символов'),
    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('Неверный формат телефона')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const { name, phone, preferences, addresses } = req.body;

        // Find and update user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Пользователь не найден'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };
        if (addresses) user.addresses = addresses;

        await user.save();

        res.json({
            success: true,
            message: 'Профиль обновлен',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                preferences: user.preferences,
                addresses: user.addresses
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при обновлении профиля'
        });
    }
});

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, [
    body('currentPassword')
        .isLength({ min: 6 })
        .withMessage('Текущий пароль должен содержать минимум 6 символов'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Новый пароль должен содержать минимум 6 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Новый пароль должен содержать буквы и цифры')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Find user with password
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Пользователь не найден'
            });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                error: 'Invalid password',
                message: 'Неверный текущий пароль'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Пароль успешно изменен'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при смене пароля'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate token)
// @access  Private
router.post('/logout', auth, async (req, res) => {
    try {
        // In a real application, you might want to add the token to a blacklist
        // For now, we'll just return success as the client will remove the token
        
        res.json({
            success: true,
            message: 'Успешный выход из системы'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при выходе'
        });
    }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
    try {
        // Generate new token
        const token = generateToken(req.user.id);

        res.json({
            success: true,
            token
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при обновлении токена'
        });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authLimiter, [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Введите корректный email')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const { email } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not
            return res.json({
                success: true,
                message: 'Если пользователь с таким email существует, инструкции по сбросу пароля будут отправлены'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        // Save reset token to user
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In a real application, send email here
        // For now, just return success
        res.json({
            success: true,
            message: 'Инструкции по сбросу пароля отправлены на email'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при сбросе пароля'
        });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', authLimiter, [
    body('token')
        .notEmpty()
        .withMessage('Токен сброса пароля обязателен'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Новый пароль должен содержать минимум 6 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Новый пароль должен содержать буквы и цифры')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const { token, newPassword } = req.body;

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid token',
                message: 'Неверный или истекший токен сброса пароля'
            });
        }

        // Find user
        const user = await User.findById(decoded.userId);
        if (!user || user.passwordResetToken !== token) {
            return res.status(400).json({
                error: 'Invalid token',
                message: 'Неверный токен сброса пароля'
            });
        }

        // Check if token expired
        if (user.passwordResetExpires < Date.now()) {
            return res.status(400).json({
                error: 'Expired token',
                message: 'Токен сброса пароля истек'
            });
        }

        // Update password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Пароль успешно сброшен'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при сбросе пароля'
        });
    }
});

module.exports = router;
