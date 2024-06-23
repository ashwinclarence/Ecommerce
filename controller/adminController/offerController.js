const offerSchema = require("../../model/offerSchema");
const productSchema = require('../../model/productSchema')
const categorySchema = require('../../model/categorySchema')
const mongoose = require('mongoose')



// render the offer page
const offerRender = async (req, res) => {
    try {

        // get the offer details
        const offer = await offerSchema.find().sort({ createdAt: -1 }).populate('offerCategoryId').populate('offerProductId')
        // get the products details
        const product = await productSchema.find({ isActive: true }).sort({ createdAt: -1 })


        // get category details
        const category = await categorySchema.find({ isActive: true }).sort({ createdAt: -1 })


        res.render('admin/offer', {
            title: "Offer Management",
            alertMessage: req.flash('errorMessage'),
            offer,
            product,
            category,
        })

    } catch (err) {
        console.log(`Error on rendering the offer page ${err}`);
    }
}



// add offer 
const addOfferPost = async (req, res) => {
    try {
        // Get the form details
        const { offerTarget, categoryOffer, productOffer, discountAmount } = req.body;

        // Validate required fields
        if (!offerTarget || !discountAmount) {
            req.flash('errorMessage', 'Data not exist please try again later');
            return res.redirect('/admin/offer');
        }

        // Validate offerTarget specific fields
        if (offerTarget === 'CATEGORY' && !categoryOffer) {
            req.flash('errorMessage', 'Category offer not found please try again later');
            return res.redirect('/admin/offer');
        }

        if (offerTarget === 'PRODUCT' && !productOffer) {
            req.flash('errorMessage', 'Product offer not found please try again later');
            return res.redirect('/admin/offer');
        }

        // Handle category offer
        if (offerTarget === 'CATEGORY') {
            const category = await categorySchema.findById(categoryOffer);
            if (!category) {
                req.flash('errorMessage', 'Category not found');
                return res.redirect('/admin/offer');
            }
            // check the category is under any offer
            const checkOffer = await offerSchema.deleteOne({ offerFor: offerTarget, offerCategoryId: category._id })


            // if category offer is already there then show a replace message
            req.flash('errorMessage', `Offer added for the products under ${category.categoryName}`);

            const newOffer = new offerSchema({
                offerFor: offerTarget.toUpperCase(),
                offerCategoryId: category._id,
                offerValue: discountAmount,
                // expiryDate: expiryDate
            });
            await newOffer.save();

            // Update all products under this category
            const productUnderCategory = await productSchema.find({ productCategory: category.categoryName });

            const bulkOperations = productUnderCategory.map(product => ({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        productDiscount: discountAmount,
                        productDiscountedPrice: product.productPrice * (1 - (discountAmount / 100))
                    }
                }
            }));

            if (bulkOperations.length > 0) {
                await productSchema.bulkWrite(bulkOperations);
            }

        } else if (offerTarget === 'PRODUCT') {
            const product = await productSchema.findById(productOffer);
            if (!product) {
                req.flash('errorMessage', 'Product not found');
                return res.redirect('/admin/offer');
            }


            // check if the product is under any offer
            const checkOffer = await offerSchema.deleteOne({ offerFor: "PRODUCT", offerProductId: product._id })

            // if product offer is already there then show a replace message
            req.flash('errorMessage', `Offer added for the product  ${product.productName}`);

            const newOffer = new offerSchema({
                offerFor: offerTarget.toUpperCase(),
                offerProductId: product._id,
                offerValue: discountAmount,
                // expiryDate: expiryDate
            });
            await newOffer.save();

            product.productDiscount = discountAmount;
            product.productDiscountedPrice = product.productPrice * (1 - (discountAmount / 100));
            await product.save();
        }


        res.redirect('/admin/offer');
    } catch (err) {
        console.log(`Error on adding offer POST ${err}`);
        req.flash('errorMessage', 'Error occurred while adding the offer. Please try again later.');
        res.redirect('/admin/offer');
    }
};



// delete offer
const deleteOffer = async (req, res) => {
    try {
        const offerID = req.params.offerID;

        if (!offerID) {
            return res.status(400).json({ error: "Offer ID is required" });
        }

        const offerDetails = await offerSchema.findById(offerID).populate('offerProductId').populate('offerCategoryId');

        if (!offerDetails) {
            return res.status(404).json({ error: "Offer not found" });
        }

        // if the product is deleted then make the discount of the products to zero
        if (offerDetails.offerFor === 'PRODUCT') {
            offerDetails.offerProductId.productDiscount = 0;
            offerDetails.offerProductId.productDiscountedPrice = offerDetails.offerProductId.productPrice;
            await offerDetails.offerProductId.save(); // Save changes to the product
        }


        // if the category is deleted then make the discount of the products under the category to zero
        if (offerDetails.offerFor === 'CATEGORY') {
            const categoryName = offerDetails.offerCategoryId.categoryName;
            await productSchema.updateMany(
                { productCategory: categoryName },
                [
                    {
                        $set: {
                            productDiscount: 0,
                            productDiscountedPrice: { $toDecimal: "$productPrice" }
                        }
                    }
                ]
            );
        }

        const deletedOffer = await offerSchema.findByIdAndDelete(offerID);

        if (!deletedOffer) {
            return res.status(409).json({ error: "Cannot delete the offer at the moment. Please try again later" });
        }

        return res.status(200).json({ success: "Offer deleted successfully" });

    } catch (err) {
        console.log("Error on deleting offer", err);
        return res.status(500).json({ error: "An error occurred while deleting the offer" });
    }
}



// // add offer 
// const addOfferPost = async (req, res) => {
//     try {
//         // Get the form details
//         const { offerTarget, categoryOffer, productOffer, discountAmount, expiryDate } = req.body;

//         // Validate required fields
//         if (!offerTarget || !discountAmount || !expiryDate) {
//             req.flash('errorMessage', 'Data not exist please try again later');
//             return res.redirect('/admin/offer');
//         }

//         // Validate offerTarget specific fields
//         if (offerTarget === 'CATEGORY' && !categoryOffer) {
//             req.flash('errorMessage', 'Category offer not found please try again later');
//             return res.redirect('/admin/offer');
//         }

//         if (offerTarget === 'PRODUCT' && !productOffer) {
//             req.flash('errorMessage', 'Product offer not found please try again later');
//             return res.redirect('/admin/offer');
//         }

//         // Handle category offer
//         if (offerTarget === 'CATEGORY') {
//             const category = await categorySchema.findById(categoryOffer);
//             if (!category) {
//                 req.flash('errorMessage', 'Category not found');
//                 return res.redirect('/admin/offer');
//             }

//             // check the category is under any offer
//             const checkOffer=await offerSchema.deleteOne({offerFor:offerTarget,offerCategoryId:category._id})
//             const newOffer = new offerSchema({
//                 offerFor: offerTarget.toUpperCase(),
//                 offerCategoryId: category._id,
//                 offerValue: discountAmount,
//                 expiryDate: expiryDate
//             });
//             await newOffer.save();


//             // add offer to the product
//         } else if (offerTarget === 'PRODUCT') {
//             const product = await productSchema.findById(productOffer);
//             if (!product) {
//                 req.flash('errorMessage', 'Product not found');
//                 return res.redirect('/admin/offer');
//             }

//             // check if the product is under any offer
//             const checkOffer=await offerSchema.deleteOne({offerFor:"PRODUCT",offerProductId:product._id})

//             const newOffer = new offerSchema({
//                 offerFor: offerTarget.toUpperCase(),
//                 offerProductId: product._id,
//                 offerValue: discountAmount,
//                 expiryDate: expiryDate
//             });
//             await newOffer.save();
//         }

//         req.flash('successMessage', 'New Offer added');
//         res.redirect('/admin/offer');
//     } catch (err) {
//         console.log(`Error on adding offer POST ${err}`);
//         req.flash('errorMessage', 'Error occurred while adding the offer. Please try again later.');
//         res.redirect('/admin/offer');
//     }
// };



// check if the current selected category already has a offer 
// if offer is present alert the admin
const offerCheckCategory = async (req, res) => {
    try {

        const { categoryID } = req.params

        if (!categoryID) {
            return res.status(404).json({ error: "category id not found" })
        }

        // convert the string into object id
        const categoryObjectID = new mongoose.Types.ObjectId(categoryID)


        // check if any offer exist
        const offerCheck = await offerSchema.findOne({ offerFor: "CATEGORY", offerCategoryId: categoryObjectID })

        // if offer exist then give the response
        if (offerCheck) {
            return res.status(200).json({ message: "Offer exist already." })
        }

    } catch (err) {
        console.log("Error on checking the offer exist and alert using fetch ", err);
        return res.status(500).json({ error: "An error occurred while checking the offer exist" });
    }
}


// check if the current selected product already has a offer 
// if offer is present alert the admin
const offerCheckProduct = async (req, res) => {
    try {

        const { productID } = req.params

        if (!productID) {
            return res.status(404).json({ error: "product id not found" })
        }

        // convert the string into object id
        const productObjectID = new mongoose.Types.ObjectId(productID)


        // check if any offer exist
        const offerCheck = await offerSchema.findOne({ offerFor: "PRODUCT", offerProductId: productObjectID })

        // if offer exist then give the response
        if (offerCheck) {
            return res.status(200).json({ message: "Offer exist already." })
        }

    } catch (err) {
        console.log("Error on checking the offer exist and alert using fetch ", err);
        return res.status(500).json({ error: "An error occurred while checking the offer exist" });
    }
}


// delete the offer based on the offer id
// const deleteOffer = async (req, res) => {
//     try {
//         const offerID = req.params.offerID;

//         if (!offerID) {
//             return res.status(400).json({ error: "Offer ID is required" });
//         }

//         // delete the offer based on the id 
//         const deletedOffer = await offerSchema.findByIdAndDelete(offerID);

//         if (!deletedOffer) {
//             return res.status(409).json({ error: "Cannot delete the offer at the moment. Please try again later" });
//         }

//         return res.status(200).json({ success: "Offer deleted successfully" });

//     } catch (err) {
//         console.log("Error on deleting offer", err);
//         return res.status(500).json({ error: "An error occurred while deleting the offer" });
//     }
// }


module.exports = {
    offerRender,
    addOfferPost,
    offerCheckCategory,
    offerCheckProduct,
    deleteOffer,
}