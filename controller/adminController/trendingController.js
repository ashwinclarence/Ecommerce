const orderSchema = require("../../model/orderSchema");
const productSchema = require("../../model/productSchema");




// render the trending items page 
const trendRender = async (req, res) => {
    try {
        // Get the trending products details
        const order = await orderSchema.aggregate([
            { $unwind: "$products" },
            { $group: { _id: "$products.productID", productCount: { $sum: 1 } } },
            { $sort: { productCount: -1 } },
            { $limit: 10 }
        ]);
        // Extract product IDs from the order results
        const productArray = order.map(ele => ele._id.valueOf());

        // Get the product details
        const products = await productSchema.find({ _id: { $in: productArray } });

        // Combine product details with order counts
        const trendingProducts = products.map(product => {
            const orderInfo = order.find(o => o._id.equals(product._id));
            return {
                ...product.toObject(),
                productCount: orderInfo ? orderInfo.productCount : 0
            };
        });

        trendingProducts.sort((a, b) => b.productCount - a.productCount)

        const topBrand = new Set();
        trendingProducts.forEach((ele) => {
            topBrand.add(ele.productBrand.trim())
        })

        const topCategory = new Set();
        trendingProducts.forEach((ele) => {
            topCategory.add(ele.productCategory.trim())
        })

        // Render the trending products page
        res.render('admin/trending', {
            title: "Trending Products",
            alertMessage: req.flash("errorMessage"),
            product: trendingProducts,
            topBrand,
            topCategory
        });

    } catch (err) {
        console.log(`Error on rendering trending products page ${err}`);
    }
};


module.exports = {
    trendRender,
}