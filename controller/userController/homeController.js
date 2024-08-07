const productSchema = require('../../model/productSchema');
const categorySchema = require('../../model/categorySchema');
const cartSchema = require('../../model/cartSchema');
const reviewSchema = require('../../model/reviewSchema');
const wishlistSchema = require('../../model/wishlistSchema');

// Render the home page using products and categories
const home = async (req, res) => {
    try {
        // Find all active categories
        const categories = await categorySchema.find({ isActive: true });

        // Extract category names
        const allCategoryNames = categories.map(item => item.categoryName);

        // Get the wishlist products
        const wishlist = await wishlistSchema.findOne({ userID: req.session.user });
        const wishlistProductIDs = wishlist ? wishlist.products.map(item => item.productID.toString()) : [];
        // Extract query parameters with default values
        const selectedCategory = req.query.productCategory ? req.query.productCategory : allCategoryNames;
        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || 100000;
        const productRating = parseInt(req.query.productRating) || 0;
        const productDiscount = parseInt(req.query.productDiscount) || 0;
        const productPriceSort = parseInt(req.query.productPriceSort) || 0;
        const userSearch = req.query.userSearch || "";

        // Pagination parameters
        const productsPerPage = 8;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * productsPerPage;

        // Query for products with filters
        const productQuery = {
            productName: { $regex: userSearch, $options: "i" },
            productCategory: { $in: selectedCategory },
            isActive: true,
            productPrice: { $gte: minPrice, $lte: maxPrice },
            // productRating: { $gte: productRating }
        };

        // Sort options
        let sortOption = {};
        if (productPriceSort === 1) {
            sortOption = { productPrice: -1 };
        } else if (productDiscount !== 0) {
            sortOption = { productDiscount: productDiscount };
        } else {
            sortOption = { createdAt: -1 }; // Default sort by createdAt descending
        }

        // Fetch products with applied filters and sorting
        const products = await productSchema.find(productQuery)
            .sort(sortOption)
            .skip(skip)
            .limit(productsPerPage);

        // Add wishlist field to products
        const productsWithWishlist = products.map(product => {
            return {
                ...product.toObject(),
                wishlist: wishlistProductIDs.includes(product._id.toString())
            };
        });
        // Count the total number of products matching the query
        const productsCount = await productSchema.countDocuments(productQuery);

        // Render the home page
        res.render('user/home', {
            title: 'User Home',
            products: productsWithWishlist,
            category: categories,
            alertMessage: req.flash('errorMessage'),
            user: req.session.user,
            pageNumber: Math.ceil(productsCount / productsPerPage),
            currentPage,
            totalPages: productsCount
        });

    } catch (err) {
        console.error(`Error rendering home page: ${err}`);

        req.flash("errorMessage", "An error occurred while rendering the home page");

    }
};

module.exports = {
    home,
};
