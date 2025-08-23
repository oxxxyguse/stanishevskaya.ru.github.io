const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'No token provided',
                message: 'Токен доступа не предоставлен'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Неверный токен доступа'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Account deactivated',
                message: 'Аккаунт деактивирован'
            });
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Неверный токен доступа'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Токен доступа истек'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка аутентификации'
        });
    }
};

// Middleware to check if user is admin
const admin = async (req, res, next) => {
    try {
        // First check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Требуется аутентификация'
            });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Доступ запрещен. Требуются права администратора'
            });
        }

        next();

    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка проверки прав доступа'
        });
    }
};

// Middleware to check if user is moderator or admin
const moderator = async (req, res, next) => {
    try {
        // First check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Требуется аутентификация'
            });
        }

        // Check if user is moderator or admin
        if (!['moderator', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Доступ запрещен. Требуются права модератора или администратора'
            });
        }

        next();

    } catch (error) {
        console.error('Moderator middleware error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка проверки прав доступа'
        });
    }
};

// Middleware to check if user owns the resource or is admin
const ownerOrAdmin = (resourceField = 'userId') => {
    return async (req, res, next) => {
        try {
            // First check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Требуется аутентификация'
                });
            }

            // If user is admin, allow access
            if (req.user.role === 'admin') {
                return next();
            }

            // Check if user owns the resource
            const resourceId = req.params[resourceField] || req.body[resourceField];
            
            if (!resourceId) {
                return res.status(400).json({
                    error: 'Resource ID required',
                    message: 'ID ресурса обязателен'
                });
            }

            if (resourceId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'Доступ запрещен. Вы можете изменять только свои ресурсы'
                });
            }

            next();

        } catch (error) {
            console.error('Owner or admin middleware error:', error);
            res.status(500).json({
                error: 'Server Error',
                message: 'Ошибка проверки прав доступа'
            });
        }
    };
};

// Middleware to check if user can access the resource
const canAccess = (permissions = []) => {
    return async (req, res, next) => {
        try {
            // First check if user is authenticated
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Требуется аутентификация'
                });
            }

            // Check if user has required permissions
            const hasPermission = permissions.some(permission => {
                if (typeof permission === 'string') {
                    return req.user.role === permission;
                }
                
                if (typeof permission === 'function') {
                    return permission(req.user, req);
                }
                
                return false;
            });

            if (!hasPermission) {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'Доступ запрещен. Недостаточно прав'
                });
            }

            next();

        } catch (error) {
            console.error('Can access middleware error:', error);
            res.status(500).json({
                error: 'Server Error',
                message: 'Ошибка проверки прав доступа'
            });
        }
    };
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                const user = await User.findById(decoded.userId).select('-password');
                
                if (user && user.isActive) {
                    req.user = user;
                }
            } catch (error) {
                // Token is invalid, but we don't fail the request
                console.warn('Invalid token in optional auth:', error.message);
            }
        }

        next();

    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue without authentication
    }
};

// Rate limiting middleware for specific endpoints
const createRateLimiter = (windowMs, max, message) => {
    const rateLimit = require('express-rate-limit');
    
    return rateLimit({
        windowMs,
        max,
        message: {
            error: 'Too many requests',
            message: message || 'Слишком много запросов, попробуйте позже'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: 'Too many requests',
                message: message || 'Слишком много запросов, попробуйте позже',
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

module.exports = {
    auth,
    admin,
    moderator,
    ownerOrAdmin,
    canAccess,
    optionalAuth,
    createRateLimiter
};
