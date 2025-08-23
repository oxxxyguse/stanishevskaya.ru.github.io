const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { auth, admin, moderator, optionalAuth } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/auth');

const router = express.Router();

// Rate limiting
const productLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per 15 minutes
    'Слишком много запросов к продуктам, попробуйте позже'
);

// Validation rules
const productValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Название должно содержать от 2 до 200 символов'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Описание должно содержать от 10 до 2000 символов'),
    body('category')
        .isMongoId()
        .withMessage('Неверный ID категории'),
    body('brand')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Бренд должен содержать от 2 до 100 символов'),
    body('sku')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('SKU должен содержать от 3 до 50 символов'),
    body('price.current')
        .isFloat({ min: 0 })
        .withMessage('Текущая цена должна быть положительным числом'),
    body('price.old')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Старая цена должна быть положительным числом'),
    body('stock.quantity')
        .isInt({ min: 0 })
        .withMessage('Количество на складе должно быть неотрицательным целым числом')
];

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', productLimiter, [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Номер страницы должен быть положительным целым числом'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Лимит должен быть от 1 до 100'),
    query('category')
        .optional()
        .isMongoId()
        .withMessage('Неверный ID категории'),
    query('brand')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Бренд должен содержать минимум 2 символа'),
    query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Минимальная цена должна быть положительным числом'),
    query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Максимальная цена должна быть положительным числом'),
    query('inStock')
        .optional()
        .isBoolean()
        .withMessage('Параметр inStock должен быть boolean'),
    query('featured')
        .optional()
        .isBoolean()
        .withMessage('Параметр featured должен быть boolean'),
    query('sort')
        .optional()
        .isIn(['name', 'price', 'createdAt', 'rating', 'popularity'])
        .withMessage('Неверный параметр сортировки'),
    query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Порядок сортировки должен быть asc или desc')
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

        const {
            page = 1,
            limit = 20,
            category,
            brand,
            minPrice,
            maxPrice,
            inStock,
            featured,
            sort = 'createdAt',
            order = 'desc',
            search
        } = req.query;

        // Build query
        const query = { status: 'published' };

        if (category) query.category = category;
        if (brand) query.brand = { $regex: brand, $options: 'i' };
        if (minPrice || maxPrice) {
            query['price.current'] = {};
            if (minPrice) query['price.current'].$gte = parseFloat(minPrice);
            if (maxPrice) query['price.current'].$lte = parseFloat(maxPrice);
        }
        if (inStock === 'true') query['stock.quantity'] = { $gt: 0 };
        if (featured === 'true') query.featured = true;

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Calculate skip value
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;

        // Execute query
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortObj)
            .limit(parseInt(limit))
            .skip(skip);

        // Get total count
        const total = await Product.countDocuments(query);

        // Calculate pagination info
        const totalPages = Math.ceil(total / parseInt(limit));
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit),
                hasNextPage,
                hasPrevPage
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при получении продуктов'
        });
    }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', productLimiter, async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        
        const products = await Product.findFeatured(parseInt(limit));
        
        res.json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при получении избранных продуктов'
        });
    }
});

// @route   GET /api/products/new
// @desc    Get new products
// @access  Public
router.get('/new', productLimiter, async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        
        const products = await Product.find({
            isNew: true,
            status: 'published',
            'stock.quantity': { $gt: 0 }
        })
        .populate('category', 'name slug')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('Get new products error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при получении новых продуктов'
        });
    }
});

// @route   GET /api/products/bestsellers
// @desc    Get bestseller products
// @access  Public
router.get('/bestsellers', productLimiter, async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        
        const products = await Product.find({
            isBestSeller: true,
            status: 'published',
            'stock.quantity': { $gt: 0 }
        })
        .populate('category', 'name slug')
        .limit(parseInt(limit))
        .sort({ 'rating.average': -1 });
        
        res.json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('Get bestsellers error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при получении бестселлеров'
        });
    }
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', productLimiter, [
    query('q')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Поисковый запрос должен содержать минимум 2 символа'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Лимит должен быть от 1 до 100')
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

        const { q: query, limit = 20 } = req.query;

        const products = await Product.search(query, {
            limit: parseInt(limit),
            inStockOnly: false
        });

        res.json({
            success: true,
            data: products,
            query
        });

    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при поиске продуктов'
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', productLimiter, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if id is valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Invalid ID',
                message: 'Неверный ID продукта'
            });
        }

        const product = await Product.findById(id)
            .populate('category', 'name slug description')
            .populate('relatedProducts', 'name slug price images rating')
            .populate('reviews.user', 'name avatar');

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: 'Продукт не найден'
            });
        }

        if (product.status !== 'published') {
            return res.status(404).json({
                error: 'Product not found',
                message: 'Продукт не найден'
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при получении продукта'
        });
    }
});

// @route   GET /api/products/slug/:slug
// @desc    Get product by slug
// @access  Public
router.get('/slug/:slug', productLimiter, async (req, res) => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({ slug, status: 'published' })
            .populate('category', 'name slug description')
            .populate('relatedProducts', 'name slug price images rating')
            .populate('reviews.user', 'name avatar');

        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: 'Продукт не найден'
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Get product by slug error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при получении продукта'
        });
    }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin/Moderator)
router.post('/', [auth, moderator], productValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const productData = req.body;

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku: productData.sku });
        if (existingProduct) {
            return res.status(400).json({
                error: 'SKU already exists',
                message: 'Продукт с таким SKU уже существует'
            });
        }

        // Create product
        const product = new Product(productData);
        await product.save();

        // Populate category
        await product.populate('category', 'name slug');

        res.status(201).json({
            success: true,
            message: 'Продукт успешно создан',
            data: product
        });

    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при создании продукта'
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin/Moderator)
router.put('/:id', [auth, moderator], productValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                details: errors.array()
            });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: 'Продукт не найден'
            });
        }

        // Check if SKU is being changed and if it already exists
        if (updateData.sku && updateData.sku !== product.sku) {
            const existingProduct = await Product.findOne({ sku: updateData.sku });
            if (existingProduct) {
                return res.status(400).json({
                    error: 'SKU already exists',
                    message: 'Продукт с таким SKU уже существует'
                });
            }
        }

        // Update product
        Object.assign(product, updateData);
        await product.save();

        // Populate category
        await product.populate('category', 'name slug');

        res.json({
            success: true,
            message: 'Продукт успешно обновлен',
            data: product
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при обновлении продукта'
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const { id } = req.params;

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: 'Продукт не найден'
            });
        }

        // Soft delete - change status to archived
        product.status = 'archived';
        await product.save();

        res.json({
            success: true,
            message: 'Продукт успешно удален'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при удалении продукта'
        });
    }
});

// @route   POST /api/products/:id/reviews
// @desc    Add review to product
// @access  Private
router.post('/:id/reviews', auth, [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Рейтинг должен быть от 1 до 5'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Заголовок отзыва должен содержать от 2 до 100 символов'),
    body('comment')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Комментарий должен содержать от 10 до 1000 символов')
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

        const { id } = req.params;
        const { rating, title, comment, images } = req.body;

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: 'Продукт не найден'
            });
        }

        // Check if user already reviewed this product
        const existingReview = product.reviews.find(
            review => review.user.toString() === req.user.id
        );

        if (existingReview) {
            return res.status(400).json({
                error: 'Already reviewed',
                message: 'Вы уже оставляли отзыв на этот продукт'
            });
        }

        // Add review
        const reviewData = {
            user: req.user.id,
            rating,
            title,
            comment,
            images: images || []
        };

        await product.addReview(reviewData);

        res.status(201).json({
            success: true,
            message: 'Отзыв успешно добавлен',
            data: reviewData
        });

    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при добавлении отзыва'
        });
    }
});

// @route   GET /api/products/:id/reviews
// @desc    Get product reviews
// @access  Public
router.get('/:id/reviews', productLimiter, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Check if product exists
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                error: 'Product not found',
                message: 'Продукт не найден'
            });
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const reviews = product.reviews
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(skip, skip + parseInt(limit));

        // Populate user info for reviews
        await Product.populate(reviews, {
            path: 'user',
            select: 'name avatar'
        });

        const total = product.reviews.length;
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: reviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            error: 'Server Error',
            message: 'Ошибка при получении отзывов'
        });
    }
});

module.exports = router;
