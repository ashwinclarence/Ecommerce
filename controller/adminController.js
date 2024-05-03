const categorySchema = require('../model/categorySchema')
const userSchema = require('../model/userSchema')
const mongoose = require('mongoose')



// render the login page for admin only if the admin's session is not present 
const login = (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin/dashboard')
    } else {
        res.render('admin/login', { title: "Admin Login", alertMessage: "" })
    }
}


// login with admin's username and password
const loginPost = (req, res) => {
    if (req.body.username === process.env.ADMIN_USERNAME && req.body.password === process.env.ADMIN_PASSWORD) {
        req.session.admin = req.body.username;
        res.redirect('/admin/dashboard')
    } else {
        res.render('admin/login', { title: "Admin Login", alertMessage: "Invalid username or password" })
    }
}


// render the users page with search using regex
const users = async (req, res) => {
    if (req.session.admin) {
        // because of http get request req.query is used instead of req.body because in get request the data is passed through the url with name of the inputBox
        const userSearch = req.query.userSearch || '';
        const users = await userSchema.find({ name: { $regex: userSearch, $options: 'i' } })
        res.render('admin/user', { title: "users list", users })
    } else {
        res.redirect('/admin/login')
    }
}

const blockUser = async (req, res) => {
    try {
        // user id from the id field in admin/block-user/:id.
        const blockUserID = req.params.id;

        // using the user id change the isBlocked field in user collection
        const blockUserResult = await userSchema.findByIdAndUpdate(blockUserID, { isBlocked: true })

        res.redirect('/admin/user')

    } catch (err) {
        console.log(`Error during blocking the user ${err}`)
    }


}
const unBlockUser = async (req, res) => {
    try {
        // user id from the id field in admin/block-user/:id.
        const unBlockUserID = req.params.id;

        // using the user id change the isBlocked field in user collection
        const unBlockUserResult = await userSchema.findByIdAndUpdate(unBlockUserID, { isBlocked: false })


        res.redirect('/admin/user')

    } catch (err) {
        console.log(`Error during unblocking the user ${err}`)
    }
}



// render the category page with search using regex
const category = async (req, res) => {

    if (req.session.admin) {
        try {
            
            const categorySearch = req.query.categorySearch || '';

            const category = await categorySchema.find({ categoryName: { $regex: categorySearch, $options: 'i' } })

            res.render('admin/category', { title: "Category list", category })

        } catch (err) {
            console.log(`Error during category listing ${err}`);
        }


    } else {
        res.redirect('/admin/login')
    }
}


// adding new category from the modal in category file
const newCategoryPost = async (req, res) => {
    try {

        // category entered in the form
        const category = {
            categoryName: req.body.newCategory,
            categoryDescription: req.body.categoryDescription,
            categoryAddedOn: new Date(),
            parentCategory: false
        }

        // check if the entered category is already present in the category collection
        const checkCategory = await categorySchema.findOne({ categoryName: req.body.newCategory })

        // if category is not present then add the new category to the collection
        if (checkCategory === null) {
            await categorySchema.insertMany(category).then(() => {
                console.log(`New Category added`);
                res.redirect('/admin/category')
            }).catch((err) => {
                console.log(`Error occurred during adding new category to the collection ${err}`)
            })

            // if product already exist in the collection then redirect to the category page without adding them to the collection
        }else{
            console.log(`Product already Present`)
            res.redirect('/admin/category')
        }

    } catch (err) {
        console.log(`Error during adding new category ${err}`);
    }
}


// edit category page

const editCategory=async(req,res)=>{
    try{

        // category id from the URL
        const categoryID=req.params.id;
        console.log(categoryID);
        const category=await categorySchema.findById(categoryID);
        if(category!=null){
            res.render('admin/editCategory',{title:`category.categoryName`,category})
        }else{
            res.redirect('/admin/category')
        }



    }catch(err){
        console.log(`Error during category updating ${err}`);
    }
}






// rendering the dashboard page
const dashboard = (req, res) => {
    if (req.session.admin) {
        res.render('admin/dashboard', { title: "Admin Dashboard" })
    } else {
        res.redirect('/admin/login')
    }
}





// render the product page
const products = (req, res) => {
    if (req.session.admin) {
        res.render('admin/products', { title: "Product list" })
    } else {
        res.redirect('/admin/login')
    }
}






// render the order page 
const order = (req, res) => {
    if (req.session.admin) {
        res.render('admin/order', { title: "Order list" })
    } else {
        res.redirect('/admin/login')
    }
}



// render the coupons page 
const coupons = (req, res) => {
    if (req.session.admin) {
        res.render('admin/coupons', { title: "Coupons" })
    } else {
        res.redirect('/admin/login')
    }
}



// logout the admin session and redirect to the login page
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(`Error occurred while destroying the session ${err}`)
        } else {
            res.redirect('/admin/login')
        }
    })
}



module.exports = {
    login,
    dashboard,
    category,
    newCategoryPost,
    editCategory,
    products,
    users,
    order,
    coupons,
    loginPost,
    logout,
    blockUser,
    unBlockUser
}