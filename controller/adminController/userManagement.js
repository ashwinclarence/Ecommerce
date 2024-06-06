

const userSchema = require('../../model/userSchema')


// render the users page with search using regex
const users = async (req, res) => {
    try {
        // because of http get request req.query is used instead of req.body because in get request the data is passed through the url with name of the inputBox
        const userSearch = req.query.userSearch || '';
        const users = await userSchema.find({ name: { $regex: userSearch, $options: 'i' } }).sort({createdAt:-1})
        res.render('admin/user', { title: "users list", users, alertMessage: req.flash('errorMessage') })

    } catch (err) {
        console.log(`Error during rendering user details`);
    }
}



// block the user 

const blockUser = async (req, res) => {
    try {
        // user id from the id field in admin/block-user/:id.
        const blockUserID = req.params.id;

        // using the user id change the isBlocked field in user collection
        const blockUserResult = await userSchema.findByIdAndUpdate(blockUserID, { isBlocked: true })

        req.flash('errorMessage', 'User successfully blocked')

        res.redirect('/admin/user')

    } catch (err) {
        console.log(`Error during blocking the user ${err}`)
    }

}


// unblock the user 

const unBlockUser = async (req, res) => {
    try {
        // user id from the id field in admin/block-user/:id.
        const unBlockUserID = req.params.id;

        // using the user id change the isBlocked field in user collection
        const unBlockUserResult = await userSchema.findByIdAndUpdate(unBlockUserID, { isBlocked: false })

        req.flash('errorMessage', 'User successfully unblocked')

        res.redirect('/admin/user')

    } catch (err) {
        console.log(`Error during unblocking the user ${err}`)
    }
}

module.exports = {
    users,
    blockUser,
    unBlockUser
}