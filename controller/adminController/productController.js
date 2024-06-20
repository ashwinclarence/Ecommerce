const categorySchema = require("../../model/categorySchema")
const productSchema = require('../../model/productSchema')
const fs = require('fs')



// render the product page
// const products = async (req, res) => {
//     try { 

//        // pagination values
//        const productsPerPage = 10;
//        const currentPage = req.query.page || 0

//         const products = await productSchema.find().skip(currentPage * productsPerPage).limit(productsPerPage).sort({createdAt:-1})
//         const totalProduct=await productSchema.find().countDocuments()
//         const pageNumber=totalProduct/12

//         res.render('admin/products', { title: "Product list", products, alertMessage: req.flash('errorMessage') ,pageNumber})
//     } catch (err) {
//         console.log(`Error on rendering product page ${err}`);
//     }


// }


const products = async (req, res) => {
    try {
        const productsPerPage = 10;  // Number of products per page
        const currentPage = parseInt(req.query.page) || 1;  // Current page from query parameter, default to 1

        const skip = (currentPage - 1) * productsPerPage;

        // Query products for the current page
        const products = await productSchema.find()
            .skip(skip)
            .limit(productsPerPage)
            .sort({ createdAt: -1 });

        // Count total number of products
        const totalProducts = await productSchema.find();

        // Calculate total number of pages
        const pageNumber = Math.ceil(totalProducts.length / productsPerPage);

        // find the blocked products count
        let blockedProducts = 0
        totalProducts.forEach((ele) => {
            if (ele.isActive === false) {
                blockedProducts++
            }
        })

        res.render('admin/products', {
            title: "Product list",
            products,
            alertMessage: req.flash('errorMessage'),
            pageNumber,
            currentPage,
            totalProducts: totalProducts.length,
            blockedProducts  // Send currentPage to highlight the current page in pagination
        });
    } catch (err) {
        console.log(`Error on rendering product page ${err}`);
        // Handle error, possibly render an error page
        res.status(500).send('Internal Server Error');
    }
};



// render the add product page
const addProduct = async (req, res) => {

    try {

        // get all category details from the category collection
        const productCategory = await categorySchema.find()

        // before render the page check whether the category is empty if its empty then send a flash message
        if (productCategory.length === 0) {
            req.flash('errorMessage', 'Product Category is empty. please add at least one category')
        }

        res.render('admin/addProducts', { title: "Add Products", alertMessage: req.flash('errorMessage'), productCategory });

    } catch (err) {
        console.log(`Error while rendering add product page ${err}`);
    }

}




// add product to the database
const addProductPost = async (req, res) => {
    try {

        const imageArray = []
        // get the image array from the file upload

        req.files.forEach((img) => {
            imageArray.push(img.path)
        })

        // find the productDiscount Price
        // let discountPrice
        // if (req.body.productDiscount != 0) {
        //     discountPrice = req.body.productPrice * (1 - (req.body.productDiscount) / 100)
        // } else {
        //     discountPrice = req.body.productPrice
        // }


        // check product already exist in the product collection
        const checkProduct = await productSchema.findOne({ productName: req.body.productName, productCategory: req.body.productCategory, productBrand: req.body.productBrand });


        // if product not exist then product is added to collection and display a flash message
        if (!checkProduct) {
            const newProduct = new productSchema({
                productName: req.body.productName,
                productBrand: req.body.productBrand,
                productPrice: req.body.productPrice,
                productDescription: req.body.productDescription,
                productQuantity: req.body.productQuantity,
                productCategory: req.body.productCategory,
                productImage: imageArray,
                // productDiscount: req.body.productDiscount,
                // productDiscountedPrice: discountPrice,
            })
            await newProduct.save()
            req.flash('errorMessage', 'Product added successfully');
        } else {
            req.flash('errorMessage', 'Product Already exist')
        }
        res.redirect('/admin/products');
    } catch (err) {
        console.error(`Error during adding new product to DB: ${err}`);
        req.flash('errorMessage', err.message || 'Failed to add product. Please try again later.');
        res.redirect('/admin/add-product');
    }
};


// render the product edit page 
const editProduct = async (req, res) => {
    try {
        // get the product id from the URL
        const productID = req.params.id;
        const product = await productSchema.findById(productID)
        const productCategory = await categorySchema.find()
        if (product) {
            res.render('admin/editProduct', { title: "Edit Product", alertMessage: req.flash('errorMessage'), product, productCategory })
        } else {
            req.flash('errorMessage', 'Unable to edit the product. Please try again')
            res.redirect('/admin/products')
        }
    } catch (err) {
        console.log(`Error during edit product page render ${err}`);
    }
}

// update the product collection based on the update in edit product form

const editProductPost = (req, res) => {
    try {
        // get the id of the product
        const productID = req.params.id;

        // find the productDiscount Price if the product discount is changed
        // let discountPrice
        // if (req.body.productDiscount != 0) {
        //     discountPrice = req.body.productPrice * (1 - (req.body.productDiscount) / 100)
        // } else {
        //     discountPrice = req.body.productPrice
        // }


        // get the image array from the file upload
        // const imageArray = []

        // req.files.forEach((img) => {
        //     imageArray.push(img.path)
        // })

        // update the product using the values from form
        productSchema.findByIdAndUpdate(productID, { productPrice: req.body.productPrice, productDescription: req.body.productDescription, productQuantity: req.body.productQuantity })
            .then((elem) => {
                req.flash('errorMessage', 'Product Updated successfully');
                res.redirect('/admin/products')
            }).catch((err) => {
                console.log(`Error while updating the product ${err}`);
                req.flash('errorMessage', 'Product is not updated')
                res.redirect('/admin/products')
            })
    } catch (err) {
        console.log(`Error during updating the product on database ${err}`);
        req.flash('errorMessage', 'Oops the action is not completed')
        res.redirect('/admin/products')
    }

}


// make the product inactive.
const productInactive = async (req, res) => {

    try {

        // product id of the product to make inactive
        const productID = req.params.id

        // update the product and make isActive to false
        const productInactive = await productSchema.findByIdAndUpdate(productID, { isActive: false });

        // if product is made inactive then send a flash message else send another flash message with reason
        if (productInactive) {
            req.flash('errorMessage', "The product has been blocked and is currently inaccessible to users")
        } else {
            req.flash('errorMessage', "Product Not Found")
        }
        res.redirect('/admin/products')
    } catch (err) {
        console.log(`Error during deactivating the product ${err}`);
    }


}



// make the product active
const productActive = async (req, res) => {

    try {
        // id of the product to make active
        const productID = req.params.id

        // update the product status of isActive to true to make it available to users
        const productInactive = await productSchema.findByIdAndUpdate(productID, { isActive: true });
        if (productInactive) {
            req.flash('errorMessage', "The product has been unblocked and is now accessible to users")
        } else {
            req.flash('errorMessage', "Product Not Found")
        }
        res.redirect('/admin/products')
    } catch (err) {
        console.log(`Error during activating the product ${err}`);
    }


}



// delete the product using the id
// this is done using fetch method from frontend. so the reply is based on status code
const productDelete = async (req, res) => {

    try {
        const productID = req.params.id;
        const deleteProduct = await productSchema.findByIdAndDelete(productID)

        // if the product is deleted then the status is set as 200 else 404
        if (deleteProduct) {
            return res.status(200).json({ message: "Product Deleted" })
        } else {
            return res.status(404).json({ message: "Product not found" })
        }

    } catch (err) {
        console.log(`Error during product delete ${err}`);
        req.flash('errorMessage', `${err.message}`)
    }
}



module.exports = {
    products,
    addProduct,
    addProductPost,
    editProduct,
    editProductPost,
    productInactive,
    productActive,
    productDelete,
}

