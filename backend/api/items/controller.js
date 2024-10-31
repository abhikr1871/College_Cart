const Item = require('./model');

const listItems = async (req,res)=>{

    try{
        const items= await Item.find();
        res.json(items);
    }catch(error){
        res.status(500).json({message:error.message});
    }

};


const createItem=async(req,res)=>{

    const {title,description,price}=req.body;

    try{
        const item=await Item.create({
            title,
            description,
            price,
            // seller: req.user._id
        });

        res.status(201).json(item);
    }catch(error){
        res.status(500).json({message:error.message});
    }
};

module.exports={listItems,createItem};
