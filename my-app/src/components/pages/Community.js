import React, { useState, useEffect } from 'react';
import './Community.css';
import { getResources, createResource, likeResource, getIssues, createIssue, upvoteIssue } from '../../services/api';
import { ThumbsUp, Plus, BookOpen, Users, ExternalLink } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import FileBase from 'react-file-base64';

const Community = () => {
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'social'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Filters
    const [semester, setSemester] = useState('');
    const [sort, setSort] = useState('newest');

    // Forms
    const [resourceForm, setResourceForm] = useState({ title: '', description: '', link: '', type: 'Note', semester: '1st' });
    const [issueForm, setIssueForm] = useState({ title: '', description: '', image: '', officialEmail: '' });

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        setItems([]); // Clear items before fetching to prevent mismatch
        fetchData();
        // eslint-disable-next-line
    }, [activeTab, semester, sort]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'notes') {
                const params = { type: 'Note', sort };
                if (semester) params.semester = semester;
                const res = await getResources(params);
                setItems(res.data || []);
            } else {
                const res = await getIssues();
                setItems(res.data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load content");
            setItems([]);
        }
        setLoading(false);
    };

    const handleCreateResource = async (e) => {
        e.preventDefault();
        try {
            await createResource(resourceForm);
            toast.success("Resource uploaded successfully!");
            setShowModal(false);
            setResourceForm({ title: '', description: '', link: '', type: 'Note', semester: '1st' });
            fetchData();
        } catch (error) {
            toast.error("Failed to upload resource");
        }
    };

    const handleCreateIssue = async (e) => {
        e.preventDefault();
        try {
            await createIssue(issueForm);
            toast.success("Issue posted successfully!");
            setShowModal(false);
            setIssueForm({ title: '', description: '', image: '', officialEmail: '' });
            fetchData();
        } catch (error) {
            toast.error("Failed to post issue");
        }
    };

    const handleLike = async (id) => {
        try {
            const { data } = await likeResource(id);
            setItems(prev => prev.map(item =>
                item._id === id ? { ...item, likes: data.likes || [] } : item
            ));
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpvote = async (id) => {
        try {
            const { data } = await upvoteIssue(id);
            setItems(prev => prev.map(item =>
                item._id === id ? { ...item, upvotes: data.upvotes || [] } : item
            ));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="community-page">

            <div className="community-container">
                <div className="community-header">
                    <h1>Campus Community</h1>
                    <p>Connect, Share, and Solve together.</p>
                </div>

                <div className="community-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        <BookOpen size={18} /> Academics
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
                        onClick={() => setActiveTab('social')}
                    >
                        <Users size={18} /> Social Feed
                    </button>
                </div>

                <div className="action-bar">
                    {activeTab === 'notes' && (
                        <div className="filter-group">
                            <select className="semester-select" value={semester} onChange={(e) => setSemester(e.target.value)}>
                                <option value="">All Semesters</option>
                                {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(sem => (
                                    <option key={sem} value={sem}>{sem} Semester</option>
                                ))}
                            </select>
                            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                                <option value="newest">Newest First</option>
                                <option value="popular">Most Popular</option>
                            </select>
                        </div>
                    )}

                    <button className="add-btn" onClick={() => setShowModal(true)}>
                        <Plus size={20} /> {activeTab === 'notes' ? 'Upload Resource' : 'Post Issue'}
                    </button>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : (
                    <>
                        {activeTab === 'notes' ? (
                            <div className="notes-grid">
                                {items?.length === 0 ? <p className="no-items">No resources found.</p> : items?.map(note => (
                                    <div key={note._id} className="note-card">
                                        <div className="note-card-header">
                                            <span className={`note-type-badge badge-${note.type?.toLowerCase() || 'note'}`}>{note.type}</span>
                                            <span className="note-sem">{note.semester} Sem</span>
                                        </div>
                                        <div className="note-content">
                                            <h3>{note.title}</h3>
                                            <p>{note.description}</p>
                                        </div>
                                        <div className="note-footer">
                                            <span className="author-info">By {note.uploaderName || 'Unknown'}</span>
                                            <div className="note-actions">
                                                <a href={note.link} target="_blank" rel="noreferrer" className="action-icon-btn">
                                                    <ExternalLink size={18} />
                                                </a>
                                                <button
                                                    className={`action-icon-btn ${note.likes?.includes(userId) ? 'liked' : ''}`}
                                                    onClick={() => handleLike(note._id)}
                                                >
                                                    <ThumbsUp size={18} /> {note.likes?.length || 0}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="social-feed">
                                {items?.length === 0 ? <p className="no-items">No social issues posted yet.</p> : items?.map(issue => (
                                    <div key={issue._id} className="issue-card">
                                        <div className="issue-header">
                                            <div className="user-avatar-placeholder">{issue.uploaderName?.[0] || '?'}</div>
                                            <div className="issue-user-info">
                                                <h4>{issue.uploaderName || 'Anonymous'}</h4>
                                                <span className="issue-date">{issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Just now'}</span>
                                            </div>
                                            {issue.officialEmail && (
                                                <a href={`mailto:${issue.officialEmail}`} className="email-tag" title="Send official report">
                                                    @{issue.officialEmail.split('@')[0]}
                                                </a>
                                            )}
                                        </div>
                                        <div className="issue-content">
                                            <h3>{issue.title}</h3>
                                            <p>{issue.description}</p>
                                            {issue.image && <img src={issue.image} alt="Issue" className="issue-image" />}
                                        </div>
                                        <div className="issue-footer">
                                            <button
                                                className={`upvote-btn ${issue.upvotes?.includes(userId) ? 'active' : ''}`}
                                                onClick={() => handleUpvote(issue._id)}
                                            >
                                                <ThumbsUp size={18} /> {issue.upvotes?.length || 0} Supports
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {showModal && (
                    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>{activeTab === 'notes' ? 'Upload Resource' : 'Post Civic Issue'}</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                            </div>
                            <div className="modal-body">
                                {activeTab === 'notes' ? (
                                    <form onSubmit={handleCreateResource}>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input type="text" required value={resourceForm.title} onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea required value={resourceForm.description} onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Semester</label>
                                            <select value={resourceForm.semester} onChange={e => setResourceForm({ ...resourceForm, semester: e.target.value })}>
                                                {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map(s => <option key={s} value={s}>{s} Semester</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Link (GDrive/URL)</label>
                                            <input type="url" required value={resourceForm.link} onChange={e => setResourceForm({ ...resourceForm, link: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={loading}>Upload</button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleCreateIssue}>
                                        <div className="form-group">
                                            <label>Title/Topic</label>
                                            <input type="text" required value={issueForm.title} onChange={e => setIssueForm({ ...issueForm, title: e.target.value })} placeholder="e.g. Broken Water Cooler" />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea required value={issueForm.description} onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}></textarea>
                                        </div>
                                        <div className="form-group">
                                            <label>Official Email to Tag (Optional)</label>
                                            <input type="email" value={issueForm.officialEmail} onChange={e => setIssueForm({ ...issueForm, officialEmail: e.target.value })} placeholder="authority@college.edu" />
                                        </div>
                                        <div className="form-group">
                                            <label>Image (Optional)</label>
                                            <div className="file-input-wrapper">
                                                <FileBase type="file" multiple={false} onDone={({ base64 }) => setIssueForm({ ...issueForm, image: base64 })} />
                                            </div>
                                        </div>
                                        <button type="submit" className="submit-btn" disabled={loading}>Post Issue</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <ToastContainer position="top-right" theme="colored" />
            </div>
        </div>
    );
};

export default Community;
