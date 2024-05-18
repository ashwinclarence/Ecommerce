const userSchema = require('../../model/userSchema')
const categorySchema = require("../../model/categorySchema");
const productSchema = require("../../model/productSchema");


// render product detail view page
const productView = async (req, res) => {

    // product id for product view
    const productID = req.params.id;

    // product details of the selected product from product collection
    const product = await productSchema.findById(productID)

    // find the product within same category
    const similarProducts = await productSchema.find({ productCategory: product.productCategory, _id: { $ne: productID } })



    if (product.length === 0) {
        req.flash("errorMessage", 'Product is currently unavailable')
        return res.redirect('/user/home')
    }

    res.render('user/productDetail', { title: product.productBrand, product, similarProducts, alertMessage: req.flash('errorMessage'), user: req.session.user })

}









module.exports = {
    productView,

}