const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')





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

        // pagination values
        const productsPerPage = 12;
        const currentPage = req.query.page || 0



        // using regex the selectedCategory is sorted
        // const products = await productSchema.find({ productCategory: { $regex: selectedCategory , $options: 'i' }, isActive: true });

        // get all product from product collection and with the query strings
        const products = await productSchema.find({
            productCategory: { $in: selectedCategory },
            isActive: true,
            productPrice: { $lte: maxPrice, $gte: minPrice }
        }).skip(currentPage * productsPerPage).limit(productsPerPage).sort({ productDiscount: productDiscount })


        // product discount zero means sort in descending order
        // if(productDiscount===0){
        //     products.sort((a, b) => {
        //         return b.productDiscount - a.productDiscount;
        //     });
        // }

        // if(productDiscount===1){
        //     products.sort((a,b)=>{
        //         return a.productDiscount - b.productDiscount
        //     })
        // }


        // render the home page
        res.render('user/home', { title: 'User Home', products, category, alertMessage: req.flash('errorMessage'), user: req.session.user })

    } catch (err) {
        console.log(`Error rendering home page ${err}`);
    }


}


module.exports = {
    home,

}