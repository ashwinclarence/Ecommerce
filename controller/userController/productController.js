const productSchema = require("../../model/productSchema");


// render product detail view page
const productView=async (req,res)=>{
    
    // product id for product view
    const productID=req.params.id;

    // product details of the selected product from product collection
    const product=await productSchema.findById(productID)

    if(product.length===0){
        req.flash("errorMessage",'Product is currently unavailable')
        return res.redirect('/user/home')
    }

    res.render('user/productDetail',{title:product.productBrand,product,alertMessage:req.flash('errorMessage')})



}

module.exports={
    productView,
}