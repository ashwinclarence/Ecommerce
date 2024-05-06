const categorySchema = require("../../model/categorySchema")
const productSchema = require('../../model/productSchema')
const multer=require('../../middleware/multer')
const fs=require('fs')



// render the product page
const products = async (req, res) => {

    const products= await productSchema.find()

    res.render('admin/products', { title: "Product list", products,alertMessage:req.flash('errorMessage') })

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

const multerMiddle=multer.array("productImage",4)

const addProductPost = async (req, res) => {
    try {

        console.log(req.files);
        const imageArray=[]
        req.files.forEach((img)=>{
            imageArray.push(img.path)
        })
        console.log(imageArray);

        const productDetails = {
            productName: req.body.productName,
            productBrand: req.body.productBrand,
            productPrice: req.body.productPrice,
            productDescription: req.body.productDescription,
            productQuantity: req.body.productQuantity,
            productCategory: req.body.productCategory,
            productImage: imageArray,
            productDiscount: 0,
            addedOn: Date.now(),
            updatedOn: Date.now(),
        };
        console.log(productDetails);

        const checkProduct = await productSchema.findOne({ productName: req.body.productName, productCategory: req.body.productCategory });
        if (!checkProduct) {
            await productSchema.insertMany(productDetails)
            req.flash('errorMessage', 'Product added successfully');
            res.redirect('/admin/products');
        } else {
            throw new Error('Product already exists');
        }
    } catch (err) {
        console.error(`Error during adding new product to DB: ${err}`);
        req.flash('errorMessage', err.message || 'Failed to add product. Please try again later.');
        res.redirect('/admin/add-product');
    }
};



module.exports = {
    products,
    addProduct,
    addProductPost,
    multerMiddle,
}