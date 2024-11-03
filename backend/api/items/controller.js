const Item = require('./model');
const { uploadImageToS3 } = require('../../middleware/uploadImage')

// const uploadItemImage = async (req, res) => {
//     try {
//         const file = req.file;
//         if (!file) {
//           return res.status(400).json({ error: 'No file uploaded' });
//         }
    
//         const result = await uploadImageToS3(
//           file.buffer,
//           file.originalname,
//           file.mimetype
//         );
    
//         res.json({
//           message: 'Image uploaded successfully',
//           data: result.Location, // URL of the uploaded file
//         });
//       } catch (error) {
//         res.status(500).json({ error: error.message });
//       }
//   };

const listItems = async (req,res)=>{

    try{
        const items= await Item.find();
        res.json(items);
    }catch(error){
        res.status(500).json({message:error.message});
    }

};


const createItem = async (req, res) => {
    const { title, description, price, image } = req.body;

    try {
        // Check if an image is provided in base64 format
        if (!image) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        // Remove the prefix if it exists
        const base64String = image.replace(/^data:image\/\w+;base64,/, '');
        const mimeType = image.match(/^data:(image\/\w+);base64,/)[1]; // Extract mime type

        // Upload the image to S3
        const uploadResult = await uploadImageToS3(
            base64String,
            title, // You can customize the image name
            mimeType
        );

        // Extract the image URL from the S3 upload result
        const imageUrl = uploadResult.Location;

        // Create a new item with the uploaded image URL
        const item = await Item.create({
            title,
            image: imageUrl,
            description,
            price,
            // seller: req.user._id
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {listItems,  createItem };
