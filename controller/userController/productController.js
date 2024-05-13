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

// filter product page render
const filterProduct = async (req, res) => {
    try {

        // if user selected a particular category then that items are shown
        // if user selected a category it is passed as a query using ?:
        const selectedCategory = req.query.category || '';
        const discountSort = parseInt(req.query.discountSort);
        const newArrival=parseInt(req.query.newArrivals)
        const minPrice=parseInt(req.query.minPrice)|| 0
        const maxPrice=parseInt(req.query.maxPrice) || 100000
        const pageNumber=req.query.page || 0;
        const productPerPage=4;
        // sort the product using regex
        let products = await productSchema.find({ productCategory: { $regex: selectedCategory , $options: 'i' }, isActive: true,productPrice:{$lte:maxPrice,$gte:minPrice} }).skip(pageNumber*productPerPage).limit(productPerPage);
        
        if (discountSort === 0) {
            products.sort((a, b) => {
                return a.productDiscount - b.productDiscount;
            });
        }
        if(discountSort===1){
            products.sort((a, b) => {
                return b.productDiscount - a.productDiscount;
            });
        }
        if(newArrival===1){
            products.sort((a,b)=>{
                return b.addedOn-a.addedOn
            })
        }
        
        
        // find all category which is active    
        const category = await categorySchema.find({ isActive: true })

        
        
        res.render('user/productFilter', { title: "Product Filter", products, category, user: req.session.user, alertMessage: req.flash('errorMessage') })
        
    } catch (err) {
        console.log(`Error rendering the product filter page ${err}`);
    }
}





module.exports = {
    productView,
    filterProduct,
}