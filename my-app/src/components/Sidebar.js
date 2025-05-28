import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { X } from "lucide-react";
import { markNotificationAsRead } from "../services/api";

function Sidebar({ userName, notifications = [], isOpen, onClose }) {
    const [visibleNotifications, setVisibleNotifications] = useState([]);

    useEffect(() => {
        if (Array.isArray(notifications)) {
            setVisibleNotifications(notifications);
        } else {
            setVisibleNotifications([]);
        }
    }, [notifications]);

    const handleRemoveNotification = async (notif) => {
        setVisibleNotifications((prev) =>
            prev.filter((n) => n._id !== notif._id)
        );
        await markNotificationAsRead(notif._id);
    };

    const markAllAsRead = async () => {
        for (const notif of visibleNotifications) {
            await markNotificationAsRead(notif._id);
        }
        setVisibleNotifications([]);
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <button className="close-btn" onClick={onClose}><X size={24} /></button>

            <div className="sidebar-profile">
                <span className="user-circle">👤</span>
                <span className="username">{userName || "Logged In User"}</span>
            </div>

            <div className="sidebar-notifications">
                <h4>Notifications</h4>
                {(visibleNotifications?.length ?? 0) === 0 ? (
                    <p className="no-notif">No new notifications</p>
                ) : (
                    <>
                        <button className="mark-all" onClick={markAllAsRead}>
                            Mark all as read
                        </button>
                        {visibleNotifications.map((notif, index) => (
                            <div key={index} className="notification-item">
                                <b>{notif.senderName || "Unknown"}:</b> <span>{notif.message}</span>
                                <button
                                    className="cross-btn"
                                    onClick={() => handleRemoveNotification(notif)}
                                    title="Dismiss"
                                >
                                    &#10006;
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
