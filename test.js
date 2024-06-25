let deletedImages = []

    //onclick function to add delete image path 
    function deleteImage(imagePath) {
    deletedImages.push(imagePath);
    document.getElementById('deletedImages').value = JSON.stringify(deletedImages);
    
    //remove the image box preview for image path
    const imageBox = document.querySelector(div[data-image-path="${imagePath.replace(/\\/g, '\\\\')}"]);
    if (imageBox) {
      imageBox.remove();
    }
  }

<div class="image-upload-preview" id="image-upload-preview">
                    <% product.productImage.forEach((img)=>{ %>
                        <div class="product-image-box d-flex flex-column" data-image-path="<%= img %>">
                            <img src="../../<%=img %>" alt="" class="preview-img ">
                            <a class="btn submit-btn" onclick="deleteImage(<%=img.replace(/\\/g, '\\\\')%>)">Delete</a>
                        </div>
                   <% }) %>
                </div>


//delete image from the backend 
        imagesToDelete.forEach(x => fs.unlinkSync(x))

 //if image present remove from db 
        if(imagesToDelete.length>0){
            await productSchema.findByIdAndUpdate(id,{
                $pull:{productImage: {$in: imagesToDelete}}
            })
        }


//add input file path into db 
        if (req.files && req.files.length > 0) {
            const imagePaths = req.files.map(file => file.path.replace(/\\/g, '/'));
            await productSchema.findByIdAndUpdate(id, {
              $push: { productImage: { $each: imagePaths } }
            });
          }