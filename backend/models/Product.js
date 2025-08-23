const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Название товара обязательно'],
        trim: true,
        maxlength: [200, 'Название не может быть длиннее 200 символов']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Описание товара обязательно'],
        maxlength: [2000, 'Описание не может быть длиннее 2000 символов']
    },
    shortDescription: {
        type: String,
        maxlength: [300, 'Краткое описание не может быть длиннее 300 символов']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Категория обязательна']
    },
    brand: {
        type: String,
        required: [true, 'Бренд обязателен'],
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        required: [true, 'SKU обязателен'],
        uppercase: true,
        trim: true
    },
    price: {
        current: {
            type: Number,
            required: [true, 'Текущая цена обязательна'],
            min: [0, 'Цена не может быть отрицательной']
        },
        old: {
            type: Number,
            min: [0, 'Старая цена не может быть отрицательной']
        },
        wholesale: {
            type: Number,
            min: [0, 'Оптовая цена не может быть отрицательной']
        }
    },
    currency: {
        type: String,
        default: 'RUB',
        enum: ['RUB', 'USD', 'EUR']
    },
    stock: {
        quantity: {
            type: Number,
            required: [true, 'Количество на складе обязательно'],
            min: [0, 'Количество не может быть отрицательным'],
            default: 0
        },
        reserved: {
            type: Number,
            default: 0,
            min: [0, 'Зарезервированное количество не может быть отрицательным']
        },
        lowStockThreshold: {
            type: Number,
            default: 5,
            min: [0, 'Порог низкого остатка не может быть отрицательным']
        }
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: String,
        isMain: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],
    specifications: [{
        name: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        unit: String,
        group: String
    }],
    features: [{
        name: String,
        description: String,
        icon: String
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    variants: [{
        name: String,
        value: String,
        priceModifier: {
            type: Number,
            default: 0
        },
        stockModifier: {
            type: Number,
            default: 0
        }
    }],
    dimensions: {
        weight: {
            value: Number,
            unit: {
                type: String,
                default: 'kg',
                enum: ['kg', 'g', 'lb', 'oz']
            }
        },
        length: {
            value: Number,
            unit: {
                type: String,
                default: 'cm',
                enum: ['cm', 'mm', 'm', 'in', 'ft']
            }
        },
        width: {
            value: Number,
            unit: {
                type: String,
                default: 'cm',
                enum: ['cm', 'mm', 'm', 'in', 'ft']
            }
        },
        height: {
            value: Number,
            unit: {
                type: String,
                default: 'cm',
                enum: ['cm', 'mm', 'm', 'in', 'ft']
            }
        }
    },
    shipping: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        freeShipping: {
            type: Boolean,
            default: false
        },
        shippingClass: {
            type: String,
            enum: ['light', 'standard', 'heavy', 'fragile'],
            default: 'standard'
        }
    },
    seo: {
        title: {
            type: String,
            maxlength: [60, 'SEO заголовок не может быть длиннее 60 символов']
        },
        description: {
            type: String,
            maxlength: [160, 'SEO описание не может быть длиннее 160 символов']
        },
        keywords: [String]
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived', 'out_of_stock'],
        default: 'draft'
    },
    visibility: {
        type: String,
        enum: ['public', 'private', 'password_protected'],
        default: 'public'
    },
    featured: {
        type: Boolean,
        default: false
    },
    isNew: {
        type: Boolean,
        default: false
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: String,
        comment: String,
        images: [String],
        helpful: {
            count: {
                type: Number,
                default: 0
            },
            users: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }]
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    warranty: {
        period: Number,
        unit: {
            type: String,
            enum: ['days', 'months', 'years'],
            default: 'months'
        },
        description: String
    },
    returnPolicy: {
        period: Number,
        unit: {
            type: String,
            enum: ['days', 'weeks'],
            default: 'days'
        },
        conditions: [String]
    },
    supplier: {
        name: String,
        contact: String,
        email: String,
        phone: String
    },
    // 1C Integration fields
    oneCId: String,
    oneCLastSync: Date,
    oneCSyncStatus: {
        type: String,
        enum: ['pending', 'synced', 'error'],
        default: 'pending'
    },
    oneCError: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
    if (this.price.old && this.price.old > this.price.current) {
        return Math.round(((this.price.old - this.price.current) / this.price.old) * 100);
    }
    return 0;
});

// Virtual for available stock
productSchema.virtual('availableStock').get(function() {
    return Math.max(0, this.stock.quantity - this.stock.reserved);
});

// Virtual for is in stock
productSchema.virtual('isInStock').get(function() {
    return this.availableStock > 0;
});

// Virtual for is low stock
productSchema.virtual('isLowStock').get(function() {
    return this.availableStock <= this.stock.lowStockThreshold && this.availableStock > 0;
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
    const mainImg = this.images.find(img => img.isMain);
    return mainImg ? mainImg.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ 'price.current': 1 });
productSchema.index({ 'stock.quantity': 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ oneCId: 1 });

// Pre-save middleware to generate slug if not provided
productSchema.pre('save', function(next) {
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }
    next();
});

// Pre-save middleware to update rating average
productSchema.pre('save', function(next) {
    if (this.reviews && this.reviews.length > 0) {
        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        this.rating.average = totalRating / this.reviews.length;
        this.rating.count = this.reviews.length;
    }
    next();
});

// Static method to find featured products
productSchema.statics.findFeatured = function(limit = 10) {
    return this.find({ 
        featured: true, 
        status: 'published',
        'stock.quantity': { $gt: 0 }
    })
    .populate('category', 'name slug')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(categoryId, options = {}) {
    const query = { 
        category: categoryId, 
        status: 'published' 
    };
    
    if (options.inStockOnly) {
        query['stock.quantity'] = { $gt: 0 };
    }
    
    return this.find(query)
    .populate('category', 'name slug')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to search products
productSchema.statics.search = function(query, options = {}) {
    const searchQuery = {
        $text: { $search: query },
        status: 'published'
    };
    
    if (options.inStockOnly) {
        searchQuery['stock.quantity'] = { $gt: 0 };
    }
    
    return this.find(searchQuery)
    .populate('category', 'name slug')
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Instance method to add review
productSchema.methods.addReview = function(reviewData) {
    this.reviews.push(reviewData);
    return this.save();
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity, type = 'reserve') {
    if (type === 'reserve') {
        this.stock.reserved += quantity;
    } else if (type === 'unreserve') {
        this.stock.reserved = Math.max(0, this.stock.reserved - quantity);
    } else if (type === 'sell') {
        this.stock.quantity = Math.max(0, this.stock.quantity - quantity);
    }
    
    return this.save();
};

module.exports = mongoose.model('Product', productSchema);
