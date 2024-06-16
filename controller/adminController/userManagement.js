

const userSchema = require('../../model/userSchema')


// render the users page with search using regex
const users = async (req, res) => {
    try {
        const dataPerPage = 10;  // Number of products per page
        const currentPage = parseInt(req.query.page) || 1;  // Current page from query parameter, default to 1

        const skip = (currentPage - 1) * dataPerPage;
        // because of http get request req.query is used instead of req.body because in get request the data is passed through the url with name of the inputBox
        const userSearch = req.query.userSearch || '';
        const users = await userSchema.find({ name: { $regex: userSearch, $options: 'i' } }).skip(skip).limit(dataPerPage).sort({ createdAt: -1 })
     
     
        const totalCollections = users.length
        // Calculate total number of pages
        const pageNumber = Math.ceil(totalCollections / dataPerPage);

        // find the count of blocked users
        let blockedUser=0
        users.forEach((ele) => {
            if (ele.isBlocked === true) {
                 blockedUser++;
            }
        });


        res.render('admin/user', { title: "users list", users, pageNumber, currentPage,blockedUser, alertMessage: req.flash('errorMessage') })

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