
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { getUserItems, deleteItem } from '../../services/api';
import Header from '../header';
import './YourItems.css';

const YourItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await getUserItems();
            console.log("Fetched User Items:", response.data);
            setItems(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching user items:", err);
            setError(`Failed to fetch items: ${err.response?.data?.message || err.message}`);
            setLoading(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteItem(itemId);
                setItems(items.filter((item) => item._id !== itemId));
            } catch (err) {
                alert('Failed to delete item');
            }
        }
    };

    return (
        <div className="your-items-page">

            <div className="your-items-container">
                <h1 className="page-title">Your Listings</h1>

                {loading ? (
                    <div className="loading-state">Loading your items...</div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : items.length === 0 ? (
                    <div className="empty-state">
                        <p>You haven't listed any items yet.</p>
                        <button onClick={() => navigate('/sell')} className="btn-primary">
                            Start Selling
                        </button>
                    </div>
                ) : (
                    <div className="items-grid">
                        {items.map((item) => (
                            <div key={item._id} className="your-item-card">
                                <div className="item-image-wrapper">
                                    <img
                                        src={item.image || item.images[0] || 'placeholder.jpg'}
                                        alt={item.title}
                                        className="item-thumbnail"
                                    />
                                    <div className="item-badges">
                                        <span className="badge category">{item.category}</span>
                                        <span className={`badge condition ${item.condition.toLowerCase().replace(' ', '-')}`}>
                                            {item.condition}
                                        </span>
                                    </div>
                                </div>

                                <div className="item-details">
                                    <h3>{item.title}</h3>
                                    <div className="item-price">₹{item.price.toLocaleString()}</div>
                                    <p className="item-description">{item.description.substring(0, 60)}...</p>

                                    <div className="item-actions">
                                        {/* <button className="btn-edit" onClick={() => handleEdit(item)}>
                      <Edit3 size={16} /> Edit
                    </button> */}
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(item._id)}
                                            title="Delete Item"
                                        >
                                            <Trash2 size={18} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default YourItems;
