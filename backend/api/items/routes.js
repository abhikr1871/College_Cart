const express=require('express');
const {listItems,createItem}=require('./controller');

const auth=require('../../middleware/auth');

const router=express.Router();

router.get('/',listItems);
router.post('/create',createItem);

module.exports=router;