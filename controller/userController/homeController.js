const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')
const cartSchema = require('../../model/cartSchema')




// render the home page using with products and categories
const home = async (req, res) => {
    try {

        // find all category which is active
        const category = await categorySchema.find({ isActive: true })

        // declare an empty array for all category names that are active in collection
        const allCategory = []

        // push each category name to the array allCategory
        category.forEach((item) => {
            allCategory.push(item.categoryName);
        })

        // if user select a particular category then it will added to selected category else all category names from above will be added.
        const selectedCategory = req.query.productCategory || allCategory;
        const minPrice = parseInt(req.query.minPrice) || 0
        const maxPrice = parseInt(req.query.maxPrice) || 100000
        const productRating = parseInt(req.query.productRating) || 0
        const productDiscount = parseInt(req.query.productDiscount) || -1
        const productPriceSort = parseInt(req.query.productPriceSort) || 0
        const userSearch = req.query.userSearch || ""

        // pagination values
        const productsPerPage = 8;
        const currentPage = req.query.page || 0

        // get all product from product collection and with the query strings
        let products = await productSchema.find({
            productName: { $regex: userSearch, $options: "i" },
            productCategory: { $in: selectedCategory },
            isActive: true,
            productPrice: { $lte: maxPrice, $gte: minPrice }
        }).sort({ addedOn: -1 })
        // let products = await productSchema.find({
        //     productName: { $regex: userSearch, $options: "i" },
        //     productCategory: { $in: selectedCategory },
        //     isActive: true,
        //     productPrice: { $lte: maxPrice, $gte: minPrice }
        // }).skip(currentPage * productsPerPage).limit(productsPerPage).sort({ addedOn: -1 })


        // sort by products price 
        if (productPriceSort === 1) {
            products.sort((a, b) => b.productPrice - a.productPrice)
        }
        // sort based the product discount
        else if (productDiscount === -1) {
            products.sort((a, b) => b.productDiscount - a.productDiscount)
        }
        else if (productDiscount === 1) {
            products.sort((a, b) => a.productDiscount - b.productDiscount)
        }
        // sort based on the product added date
        else {
            products.sort((a, b) => b.addedOn - a.addedOn)
        }

        // added limit products on a page 
        const startIndex = currentPage * productsPerPage;
        const paginatedProducts = products.slice(startIndex, startIndex + productsPerPage);

        // count the number of document satisfied the filter
        const productsCount = await productSchema.find({
            productName: { $regex: userSearch, $options: "i" },
            productCategory: { $in: selectedCategory },
            isActive: true,
            productPrice: { $lte: maxPrice, $gte: minPrice }
        }).countDocuments()


        // render the home page
        res.render('user/home', { title: 'User Home', products:paginatedProducts, category, alertMessage: req.flash('errorMessage'), user: req.session.user })

    } catch (err) {
        console.log(`Error rendering home page ${err}`);
    }


}


module.exports = {
    home,

}