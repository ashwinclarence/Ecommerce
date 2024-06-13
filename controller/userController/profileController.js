const userSchema = require("../../model/userSchema");
const walletSchema = require("../../model/walletSchema");

const profileView = async (req, res) => {
    try {

        // find the user details using the user's email
        const userDetail = await userSchema.findById(req.session.user)
        const wallet=await walletSchema.findOne({userID:req.session.user})


        // if user data is not available by any chance then redirect to home page with an alert message
        if (userDetail === null) {
            req.flash('errorMessage', 'Apologies, we encountered an issue while loading the user data. Please try again later.')
            return res.redirect('/user/home')
        }

        // if user data is available then redirect to user profile page
        res.render('user/profile', { title: "Profile", alertMessage: req.flash('errorMessage'), user: req.session.user, userDetail ,wallet:wallet.balance})


    } catch (err) {
        console.log(`Error during profile page render ${err}`);
    }
}


// update the user profile
const updateProfile=async (req,res)=>{
    try {

        // get the form data
        const userName=req.body.name;
        const phone=req.body.phone;

        // update the user details
        const profileUpdate=await userSchema.findByIdAndUpdate(req.session.user,{name:userName,phone:phone})

        if(profileUpdate){
            req.flash('errorMessage','Profile updated');
        }else{
            req.flash("errorMessage",'Error during updating the user profile please try again')
        }
        res.redirect("/user/profile")
        
    } catch (err) {
        console.log(`Error during updating the user profile ${err}`);
    }
}


// address management in the user side 
const addAddress = async (req, res) => {
    try {

        // user address details added
        const userAddress = {
            contactName: req.body.username,
            pincode: req.body.pincode,
            homeAddress: req.body.addressHome,
            areaAddress: req.body.addressArea,
            landmark: req.body.addressLandmark
        }
        
    
        // get current user data from collection
        const user = await userSchema.findById(req.session.user)
        
        // if maximum address size reached then redirect to login page
        if (user.address.length > 3) {
            req.flash("errorMessage", "Maximum Address limit Reached")
            return res.redirect('/user/profile')
        }
      
        
        // Add the new address to the user's address array
        user.address.push(userAddress);
        // Save the updated user document
        await user.save();

        req.flash('errorMessage',"Address added")
        res.redirect('/user/profile')

    } catch (err) {
        console.log(`Error adding new address in collection ${err}`);
    }
}



// edit the user address 
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
        const user = await userSchema.findById(req.session.user)

        user.address[addressIndex] = userAddress
        await user.save();

         req.flash('errorMessage','user address edited')
        res.redirect('/user/profile')

    } catch (err) {
        console.log(`Error during editing address in collection in post request ${err}`);
    }
}




module.exports = {
    profileView,
    updateProfile,
    addAddress,
    editAddressPost,
}