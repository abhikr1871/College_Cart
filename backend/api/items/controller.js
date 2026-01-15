const Item = require('./model');
const { uploadImageToS3 } = require('../../middleware/uploadImage');
const authMiddleware = require('../../middleware/auth.js');

// List items for the authenticated user's college
const listItems = async (req, res) => {
  try {
    const userCollege = req.user?.collegeName;
    console.log("🔍 Fetching items for college:", userCollege, "| User:", req.user?.name); // Debug Log

    if (!userCollege) {
      return res.status(400).json({ message: 'User college information is missing' });
    }

    const items = await Item.find({ collegeName: userCollege });
    // const items = await Item.find({}); // DEBUG: Fetch ALL items
    // console.log(`✅ Found ${items.length} items (ALL)`); // Debug Log
    res.json(items);
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new item with sellerId from the authenticated user
const createItem = async (req, res) => {
  const { title, description, price, images, category, condition, brand, negotiable } = req.body;
  // Legacy support: if frontend sends single 'image', treat it... (frontend will be updated to send images array)

  try {
    const userCollege = req.user?.collegeName;
    const userId = req.user?.user_id;

    if (!userCollege || !userId) {
      return res.status(400).json({ message: 'User college or seller ID information is missing' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const uploadedImageUrls = [];

    // Process and upload each image
    for (const base64Img of images) {
      if (!base64Img) continue;
      const base64String = base64Img.replace(/^data:image\/\w+;base64,/, '');
      const mimeType = base64Img.match(/^data:(image\/\w+);base64,/)[1];

      const uploadResult = await uploadImageToS3(base64String, `${title}-${Date.now()}`, mimeType);
      uploadedImageUrls.push(uploadResult.Location);
    }

    // Create item in the database
    const item = await Item.create({
      title,
      image: uploadedImageUrls[0], // Primary image for legacy compatibility
      images: uploadedImageUrls,
      description,
      price,
      category: category || 'Others',
      condition: condition || 'Good',
      brand: brand || '',
      negotiable: negotiable || false,
      sellerId: userId,
      sellerName: req.user?.name,
      collegeName: userCollege
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ message: error.message });
  }
};



// Get items for the specific logged-in user
const getUserItems = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID missing' });
    }
    const items = await Item.find({ sellerId: userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an item
const deleteItem = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const itemId = req.params.id;

    const item = await Item.findOneAndDelete({ _id: itemId, sellerId: userId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an item
const updateItem = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const itemId = req.params.id;
    const updates = req.body;

    // basic security: don't allow changing sellerId or collegeName easily via this route if not intended
    delete updates.sellerId;
    delete updates.collegeName;

    const item = await Item.findOneAndUpdate(
      { _id: itemId, sellerId: userId },
      updates,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found or unauthorized' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { listItems, createItem, getUserItems, deleteItem, updateItem };
