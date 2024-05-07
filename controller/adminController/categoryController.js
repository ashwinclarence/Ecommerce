const categorySchema = require('../../model/categorySchema')





// render the category page with search using regex
const category = async (req, res) => {

  
        try {

            const categorySearch = req.query.categorySearch || '';

            const category = await categorySchema.find({ categoryName: { $regex: categorySearch, $options: 'i' } })

            res.render('admin/category', { title: "Category list", category ,alertMessage:req.flash('errorMessage')})

        } catch (err) {
            console.log(`Error during category listing ${err}`);
        }


  
}


// adding new category from the modal in category file
const newCategoryPost = async (req, res) => {
    try {


        // get the new category name and trim unwanted white spaces
        let categoryName = req.body.newCategory;
        categoryName=categoryName.trim();
        categoryName=categoryName.toLowerCase()


        // category entered in the form
        const category = {
            categoryName: categoryName,
            categoryAddedOn: new Date(),
            parentCategory: false,
            isActive: true,
        }

        // check if the entered category is already present in the category collection
        const checkCategory = await categorySchema.findOne({ categoryName: categoryName })

        // if category is not present then add the new category to the collection
        if (checkCategory === null) {
            await categorySchema.insertMany(category).then(() => {
                req.flash('errorMessage','New category has been added');
                console.log(`New Category added`);
                res.redirect('/admin/category')
            }).catch((err) => {
                console.log(`Error occurred during adding new category to the collection ${err}`)
            })

            // if product already exist in the collection then redirect to the category page without adding them to the collection
        } else {

            // send and error message that the category is already present
            req.flash('errorMessage','Product already present');
            res.redirect('/admin/category')
        }

    } catch (err) {
        console.log(`Error during adding new category ${err}`);
    }
}


// render edit category page with category name

const editCategory = async (req, res) => {
    try {
       
            // category id from the URL
            const categoryID = req.params.id;
            const category = await categorySchema.findById(categoryID);
            if (category != null) {
                res.render('admin/editCategory', { title: category.categoryName, category, alertMessage:req.flash('errorMessage') })
            } else {
                req.flash('errorMessage','An unexpected error occurred while editing the category. Please attempt the operation again.');
                res.redirect('/admin/category')
            }

    } catch (err) {
        console.log(`Error during category updating ${err}`);
    }
}


// edit category and update the category collection
const editCategoryPost = async (req, res) => {
    try {
        
        const categoryID = req.params.id;

        // get the new category name from the form and trim unwanted white spaces 
        let editCategory=req.body.editCategory
        editCategory=editCategory.trim()
        // convert the category to lowercase
        editCategory=editCategory.toLowerCase()

        // check whether category is already present in the collection
        const checkCategory= await categorySchema.findOne({categoryName:editCategory})

        if(checkCategory==null){
            await categorySchema.findByIdAndUpdate(categoryID, { categoryName: editCategory })
            req.flash('errorMessage','Success: Category update successfully')
            res.redirect('/admin/category')
        }else{
            req.flash('errorMessage','Warning: Category already exists. Please ensure no duplicates are being added.')
            res.redirect('/admin/category')
        }

        // res.redirect('/admin/category')


    } catch (err) {
        console.log(`Error during editing category ${err}`);
    }

}

// hide category
const hideCategory = async (req, res) => {
    try {

        // category id of the category
        const categoryID = req.params.id

        // blocking the category with specific id
        const blockedCategory = await categorySchema.findByIdAndUpdate(categoryID, { isActive: false })

        // redirect to category page
        res.redirect('/admin/category')

    } catch (err) {
        console.log(`Error during hiding category ${err}`);
    }
}


// unhide category
const unHideCategory = async (req, res) => {
    try {

        // category id of the category
        const categoryID = req.params.id

        // blocking the category with specific id
        const unBlockedCategory = await categorySchema.findByIdAndUpdate(categoryID, { isActive: true })

        // redirect to category page
        res.redirect('/admin/category')

    } catch (err) {
        console.log(`Error during un-hiding category ${err}`);
    }
}


// delete category 
const deleteCategory=async(req,res)=>{
    try{
        const categoryID=req.params.id

        const deleteCategory= await categorySchema.findByIdAndDelete(categoryID)
        
        if(deleteCategory!=null){
            req.flash('errorMessage','Category has been successfully deleted')
            res.redirect('/admin/category')
        }else{
            req.flash('errorMessage','Error: Unable to delete the category.')
            res.redirect('/admin/category')
        }

    }catch(err){
        console.log(`Error during deleting the category ${err}`);
    }
}


module.exports={
    category,
    newCategoryPost,
    editCategory,
    editCategoryPost,
    hideCategory,
    unHideCategory,
    deleteCategory
}