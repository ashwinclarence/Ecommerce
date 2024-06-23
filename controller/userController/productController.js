const userSchema = require('../../model/userSchema')
const categorySchema = require("../../model/categorySchema");
const productSchema = require("../../model/productSchema");
const cartSchema = require('../../model/cartSchema');
const reviewSchema = require('../../model/reviewSchema');


// render product detail view page
const productView = async (req, res) => {

    
    // product id for product view
    const productID = req.params.id;
    
    // product details of the selected product from product collection
    const product = await productSchema.findById(productID)
    

    const review=await reviewSchema.findOne({productID:product._id})


    // find the product within same category
    const similarProducts = await productSchema.find({ productCategory: product.productCategory, _id: { $ne: productID } })

    // if current product is in the cart then set the itemInCart to true else it will be false
    let itemInCart = false

    // if user logged in then check the cart items
    if (req.session.user) {
        // check the product is already in the cart
        const cartCheck = await cartSchema.findOne({ userID: req.session.user }).populate('items.productID')

        if (cartCheck) {
            cartCheck.items.forEach((items) => {
                if (items.productID.id === productID) {
                    itemInCart = true
                }
            })
        }


    }


    if (product.length === 0) {
        req.flash("errorMessage", 'Product is currently unavailable')
        return res.redirect('/user/home')
    }

    res.render('user/productDetail', { title: product.productBrand, product, similarProducts, itemInCart, alertMessage: req.flash('errorMessage'), user: req.session.user })

}









module.exports = {
    productView,

}