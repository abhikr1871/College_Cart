const { Resource, Issue } = require('./model');
const User = require('../users/model');

// --- Resources (Notes/Assignments) ---

exports.createResource = async (req, res) => {
    try {
        const { title, description, link, type, semester } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newResource = new Resource({
            title,
            description,
            link,
            type,
            semester,
            uploadedBy: userId,
            uploaderName: user.name,
            college: user.collegeName
        });

        await newResource.save();
        res.status(201).json(newResource);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.listResources = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { type, semester, sort } = req.query; // sort='popular' or 'newest'

        let query = { college: user.collegeName };
        if (type) query.type = type;
        if (semester) query.semester = semester;

        // Default to sorting by likes length (popularity) if requested
        let resources = await Resource.find(query).sort({ createdAt: -1 });

        if (sort === 'popular') {
            resources.sort((a, b) => b.likes.length - a.likes.length);
        }

        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.likeResource = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user.id;

        const resource = await Resource.findById(resourceId);
        if (!resource) return res.status(404).json({ message: "Resource not found" });

        const index = resource.likes.indexOf(userId);
        if (index === -1) {
            resource.likes.push(userId);
        } else {
            resource.likes.splice(index, 1);
        }

        await resource.save();
        res.json({ likes: resource.likes });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// --- Issues (Social Community) ---

exports.createIssue = async (req, res) => {
    try {
        const { description, image, title, officialEmail } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newIssue = new Issue({
            title,
            description,
            image,
            uploadedBy: userId,
            uploaderName: user.name,
            college: user.collegeName,
            officialEmail
        });

        await newIssue.save();
        res.status(201).json(newIssue);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.listIssues = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Newest first
        const issues = await Issue.find({ college: user.collegeName }).sort({ createdAt: -1 });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.upvoteIssue = async (req, res) => {
    try {
        const issueId = req.params.id;
        const userId = req.user.id;

        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ message: "Issue not found" });

        const index = issue.upvotes.indexOf(userId);
        if (index === -1) {
            issue.upvotes.push(userId);
        } else {
            issue.upvotes.splice(index, 1);
        }

        await issue.save();
        res.json({ upvotes: issue.upvotes });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
