const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
    createResource,
    listResources,
    likeResource,
    createIssue,
    listIssues,
    upvoteIssue
} = require('./controller');

// Resources routes
router.post('/resources', auth, createResource);
router.get('/resources', auth, listResources);
router.put('/resources/:id/like', auth, likeResource);

// Issues routes
router.post('/issues', auth, createIssue);
router.get('/issues', auth, listIssues);
router.put('/issues/:id/upvote', auth, upvoteIssue);

module.exports = router;
