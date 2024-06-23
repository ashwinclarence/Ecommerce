const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')
const cartSchema = require('../../model/cartSchema')
const reviewSchema=require('../../model/reviewSchema')
const wishlistSchema=require('../../model/wishlistSchema')


// render the home page using with products and categories
const home = async (req, res) => {
    try {
        // Find all active categories
        const categories = await categorySchema.find({ isActive: true })

        // Extract category names
        const allCategoryNames = categories.map(item => item.categoryName);

        // Extract query parameters with default values
        const selectedCategory = req.query.productCategory ? [req.query.productCategory] : allCategoryNames;
        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || 100000;
        const productRating = parseInt(req.query.productRating) || 0;
        const productDiscount = parseInt(req.query.productDiscount) || 0;
        const productPriceSort = parseInt(req.query.productPriceSort) || 0;
        const userSearch = req.query.userSearch || "";

        // Pagination parameters
        const productsPerPage = 8;
        const currentPage = parseInt(req.query.page) || 0;

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
            .skip(currentPage * productsPerPage)
            .limit(productsPerPage);

        // Count the total number of products matching the query
        const productsCount = await productSchema.countDocuments(productQuery);

        // Render the home page
        res.render('user/home', {
            title: 'User Home',
            products,
            category: categories,
            alertMessage: req.flash('errorMessage'),
            user: req.session.user,
            currentPage,
            totalPages: Math.ceil(productsCount / productsPerPage)
        });

    } catch (err) {
        console.error(`Error rendering home page: ${err}`);
        res.status(500).send("Internal Server Error");
    }
};






module.exports = {
    home,

}