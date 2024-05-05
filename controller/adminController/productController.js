const categorySchema = require("../../model/categorySchema")



// render the product page
const products = (req, res) => {

    res.render('admin/products', { title: "Product list", products: [] })

}


const addProduct = async (req, res) => {

    try {

        const productCategory = await categorySchema.find()
        if (productCategory.length === 0) {
            req.flash('errorMessage', 'Product Category is empty. please add at least one category')
        }

        res.render('admin/addProducts', { title: "Add Products", alertMessage: req.flash('errorMessage'), productCategory });

    } catch (err) {
        console.log(`Error while rendering add product page ${err}`);
    }

}


module.exports = {
    products,
    addProduct,

}