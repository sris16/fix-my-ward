import { useEffect, useState } from "react";
import axios from "axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  // 🔔 Mark as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔁 Update UI instantly
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );

    } catch (error) {
      console.log(error);
    }
  };

  // 🔥 FIXED useEffect (no external function)
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");

        const { data } = await axios.get(
          "http://localhost:5000/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setNotifications(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadNotifications();
  }, []);

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-emerald-400">
        Notifications 🔔
      </h1>

      {notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl ${
                n.read ? "bg-gray-800" : "bg-gray-700"
              }`}
            >
              <p>{n.message}</p>

              {!n.read && (
                <button
                  onClick={() => markAsRead(n._id)}
                  className="mt-2 text-sm bg-blue-500 px-3 py-1 rounded"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;