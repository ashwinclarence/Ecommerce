const userSchema = require("../../model/userSchema");

const profileView = async (req, res) => {
    try {

        // find the user details using the user's email
        const userDetail = await userSchema.findOne({ email: req.session.user });

        // if user data is not available by any chance then redirect to home page with an alert message
        if (userDetail === null) {
            req.flash('errorMessage', 'Apologies, we encountered an issue while loading the user data. Please try again later.')
            return res.redirect('/user/home')
        }

        // if user data is available then redirect to user profile page
        res.render('user/profile', { title: "Profile", alertMessage: req.flash('errorMessage'), user: req.session.user, userDetail })


    } catch (err) {
        console.log(`Error during profile page render ${err}`);
    }
}

const addAddress = async (req, res) => {
    try {

        // user address details added
        const userAddress = {
            contactName: req.body.name,
            pincode: req.body.pincode,
            homeAddress: req.body.addressHome,
            areaAddress: req.body.addressArea,
            landmark: req.body.addressLandmark
        }
        
        
        
        // get current user data from collection
        const user = await userSchema.findOne({ email: req.session.user })
        
        // if maximum address size reached then redirect to login page
        if (user.address.length > 3) {
            req.flash("errorMessage", "Maximum Address limit Reached")
            return res.redirect('/user/profile')
        }
      
        
        // Add the new address to the user's address array
        user.address.push(userAddress);
        // Save the updated user document
        await user.save();

        res.redirect('/user/profile')

    } catch (err) {
        console.log(`Error adding new address in collection ${err}`);
    }
}

const editAddress = async (req, res) => {
    try {
        const addressNumber = req.query.addressNumber

        const userDetails = await userSchema.findOne({ email: req.session.user })

        if (userDetails === null) {
            req.flash("errorMessage", "unexpected error occurred. Please try again later");
            res.redirect('/user/profile')
        } else {
            const addressDetails = userDetails.address[addressNumber]
            res.render('user/editAddress', { title: "Edit Address", addressDetails, addressNumber, user: req.session.user, alertMessage: req.flash('errorMessage') })
        }



    } catch (err) {
        console.log(`Error during editing address ${err}`);
    }
}

const editAddressPost = async (req, res) => {
    try {

        const addressIndex = req.params.id
        const userAddress = {
            contactName: req.body.name,
            pincode: req.body.pincode,
            homeAddress: req.body.addressHome,
            areaAddress: req.body.addressArea,
            landmark: req.body.addressLandmark
        }
         // get current user data from collection
         const user = await userSchema.findOne({ email: req.session.user })

         user.address[addressIndex]=userAddress
         await user.save();

         req.flash('errorMessage','user address edited')
        res.redirect('/user/profile')

    } catch (err) {
        console.log(`Error during editing address in collection in post request ${err}`);
    }
}


// deleting user
const deleteAddress=async (req,res)=>{

    const addressIndex=req.body.id;

    // Get the current user data from the collection
    const user = await userSchema.findOne({ email: req.session.user });

    // Remove the address at the specified index in the user's address array
    user.address.splice(addressIndex, 1);

    // Save the updated user document
    user.save().then(()=>{
        req.flash('errorMessage','User address deleted successfully')
        res.redirect('/user/profile')
    }).catch((err)=>{
        req.flash('errorMessage','Oops something happened in the middle. please try again')
        res.redirect('/user/profile')
    })

   
}

module.exports = {
    profileView,
    addAddress,
    editAddress,
    editAddressPost,
    deleteAddress
}