
const productSchema = require('../../model/productSchema')
const wishlistSchema = require('../../model/wishlistSchema')



const wishlist =async  (req, res) => {

    try {

        // find the wishlist items
        const wishlist=await wishlistSchema.findOne({userID:req.session.user}).populate('products.productID')

        if(wishlist){
            // sort the wishlist based on date of added
        wishlist.products.sort((a,b)=>b.createdAt-a.createdAt)
        res.render('user/wishlist', { title: "Wishlist",products:wishlist.products, alertMessage: req.flash('errorMessage'), user: req.session.user })
    }else{
            res.render('user/wishlist', { title: "Wishlist",products:[], alertMessage: req.flash('errorMessage'), user: req.session.user })

        }

        


    } catch (err) {
        console.log(`Error on rendering the wishlist ${err}`)
    }


}


// adding products to wishlist
const addWishlist = async (req, res) => {
    try {

        const productID = req.params.id;

        // find the actual product 
        const actualProductDetails = await productSchema.findById(productID)

        if (!actualProductDetails) {
            return res.status(404).json({ error: "Product not found" })
        }

        // check if user has a wishlist collection
        const wishlist = await wishlistSchema.findOne({ userID: req.session.user }).populate('products.productID')
        // if user has a wishlist then update the wishlist  
        if (wishlist) {

            let productExist = false

            wishlist.products.forEach((ele) => {
                if (ele.productID.id === productID) {
                    productExist = true
                }
            })

            if (productExist === false) {
                wishlist.products.push({ productID: actualProductDetails._id })
                // save the new wishlist 
                await wishlist.save()
                return res.status(200).json({ message: "product added to wishlist " })

            } else {

                return res.status(200).json({ message: "product already in the wishlist " })
            }


        } else {

            // add new wishlist items
            const addWishlist = new wishlistSchema({
                userID: req.session.user,
                products: [{
                    productID: actualProductDetails._id
                }]
            })

            // save the changes
            await addWishlist.save()
            return res.status(200).json({ message: "product added to wishlist " })
        }

    } catch (err) {
        console.log(`Error on adding product to wishlist ${err}`)
        return res.status(500).json({ message: "Error adding product to wishlist" });
    }
}

const removeWishlist=async (req,res)=>{
    try {

        const productID=req.params.id;

        const wishlist=await wishlistSchema.findOne({userID:req.session.user}).populate('products.productID')

        if(wishlist===null){
            return res.status(404).json({error:"Product not found in wishlist"})
        }

        const newWishList=wishlist.products.filter((ele)=>{
            if(ele.productID.id!=productID){
                return ele
            }
        })

        wishlist.products=newWishList

        await wishlist.save()

        return res.status(200).json({message:"Product removed from wishlist"})
        
    } catch (err) {
        console.log(`Error on removing the products from wishlist ${err}`)
        return res.status(404).json({error:"Error on removing the products from wishlist"})
    }
}

module.exports = {
    wishlist,
    addWishlist,
    removeWishlist,
}
