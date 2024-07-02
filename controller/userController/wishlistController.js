
const productSchema = require('../../model/productSchema')
const wishlistSchema = require('../../model/wishlistSchema')



const wishlist = async (req, res) => {

    try {

        // find the wishlist items
        const wishlist = await wishlistSchema.findOne({ userID: req.session.user }).populate('products.productID')

        if (wishlist) {
            // sort the wishlist based on date of added
            wishlist.products.sort((a, b) => b.createdAt - a.createdAt)
            res.render('user/wishlist', { title: "Wishlist", products: wishlist.products, alertMessage: req.flash('errorMessage'), user: req.session.user })
        } else {
            res.render('user/wishlist', { title: "Wishlist", products: [], alertMessage: req.flash('errorMessage'), user: req.session.user })

        }
    } catch (err) {
        console.log(`Error on rendering the wishlist ${err}`)
    }


}


// adding products to wishlist
const addWishlist = async (req, res) => {
    try {
        const productID = req.params.id;
        const userID = req.session.user;

        // Find the actual product
        const actualProductDetails = await productSchema.findById(productID);

        if (!actualProductDetails) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if user has a wishlist
        const wishlist = await wishlistSchema.findOne({ userID }).populate('products.productID');

        if (wishlist) {
            const productIndex = wishlist.products.findIndex((item) => item.productID.id === productID);
    
            if (productIndex > -1) {
                // Remove the product from the wishlist
                wishlist.products.splice(productIndex, 1);
                await wishlist.save();
                return res.status(200).json({ exist: "Product removed from wishlist" });
            } else {
                wishlist.products.push({ productID: actualProductDetails._id });
                await wishlist.save();
                return res.status(200).json({ success: "Product added to wishlist" });
            }
        } else {
            // Create a new wishlist
            const newWishlist = new wishlistSchema({
                userID,
                products: [{ productID: actualProductDetails._id }]
            });
    
            await newWishlist.save();
            return res.status(200).json({ success: "Product added to wishlist" });
        }
    } catch (err) {
        console.error(`Error adding product to wishlist: ${err}`);
        return res.status(500).json({ message: "Error adding product to wishlist" });
    }
};



const removeWishlist = async (req, res) => {
    try {

        const productID = req.params.id;

        const wishlist = await wishlistSchema.findOne({ userID: req.session.user }).populate('products.productID')

        if (wishlist === null) {
            return res.status(404).json({ error: "Product not found in wishlist" })
        }

        const newWishList = wishlist.products.filter((ele) => {
            if (ele.productID.id != productID) {
                return ele
            }
        })

        wishlist.products = newWishList

        await wishlist.save()

        return res.status(200).json({ message: "Product removed from wishlist" })

    } catch (err) {
        console.log(`Error on removing the products from wishlist ${err}`)
        return res.status(404).json({ error: "Error on removing the products from wishlist" })
    }
}

module.exports = {
    wishlist,
    addWishlist,
    removeWishlist,
}
