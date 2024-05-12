const userSchema = require("../../model/userSchema");

const profileView=async (req,res)=>{
    try {

        // find the user details using the user's email
        const userDetail=await userSchema.findOne({email:req.session.user});

        // if user data is not available by any chance then redirect to home page with an alert message
        if(userDetail===null){
            req.flash('errorMessage','Apologies, we encountered an issue while loading the user data. Please try again later.')
            return res.redirect('/user/home')
        }

        // if user data is available then redirect to user profile page
        res.render('user/profile',{title:"Profile",alertMessage:req.flash('errorMessage'),user:req.session.user,userDetail})


    } catch (err) {
        console.log(`Error during profile page render ${err}`);
    }
}

module.exports={
    profileView
}