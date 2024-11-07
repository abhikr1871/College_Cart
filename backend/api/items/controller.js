const Item = require('./model');
const { uploadImageToS3 } = require('../../middleware/uploadImage')
const authMiddleware = require('../../middleware/auth.js'); 


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

const listItems = async (req, res) => {
    try {
      // Confirm `collegeName` exists in `req.user`
      const userCollege = req.user?.collegeName;
      if (!userCollege) {
        return res.status(400).json({ message: 'User college information is missing' });
      }
  
      // Fetch items only from the same college
      const items = await Item.find({ collegeName: userCollege });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  const createItem = async (req, res) => {
    const { title, description, price, image } = req.body;
  
    try {
      const userCollege = req.user?.collegeName; // Get college from authenticated user
      console.log(req.user); // Debugging the user object

      if (!userCollege) {
        return res.status(400).json({ message: 'User college information is missing' });
      }
      if (!image) {
        return res.status(400).json({ message: 'Image file is required' });
      }
  
      const base64String = image.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = image.match(/^data:(image\/\w+);base64,/)[1];
  
      const uploadResult = await uploadImageToS3(
        base64String,
        title,
        mimeType
      );
  
      const imageUrl = uploadResult.Location;
  
      const item = await Item.create({
        title,
        image: imageUrl,
        description,
        price,
        collegeName: userCollege
      });
  
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
module.exports = {listItems,  createItem };
