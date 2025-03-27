import { Button, ConfigProvider, Badge, Spin, Tag } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { MdCancel, MdOutlineMarkEmailRead } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { useProfileQuery } from "../../redux/apiSlices/profileSlice";
import {
  useNotificationQuery,
  useReadMutation,
} from "../../redux/apiSlices/notificationSlice";
import EmptyNotification from "../../assets/quiloco/EmptyNotification.png";
import moment from "moment";
import { CheckCircleOutlined } from "@ant-design/icons";

function NotificationPopover() {
  const socketRef = useRef(null);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  const { data: profile } = useProfileQuery();
  const {
    data: notifications,
    refetch,
    isLoading: notificationLoading,
  } = useNotificationQuery();

  const [readNotification, { isLoading: updateLoading }] = useReadMutation();
  const [readAllNotifications] = useReadMutation();

  useEffect(() => {
    socketRef.current = io("http://10.0.60.126:6007");

    const handleNewNotification = (notification) => {
      refetch();
    };

    if (profile?.data?._id) {
      socketRef.current.on(
        `notification::${profile.data._id}`,
        handleNewNotification
      );
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(
          `notification::${profile?.data?._id}`,
          handleNewNotification
        );
        socketRef.current.disconnect();
      }
    };
  }, [refetch, profile?.data?._id]);

  const removeMessage = async (id) => {
    // Implement your API call to delete/archive the notification
    // After successful deletion:
    refetch();
  };

  const markAsRead = async (id) => {
    try {
      await readNotification(id);
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await readAllNotifications();
      refetch();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await readNotification(notification._id);
      }
      refetch();
      // Add navigation logic if needed
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    return moment(timestamp).fromNow();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "ALERT":
        return "red";
      case "INFO":
        return "blue";
      case "SUCCESS":
        return "green";
      default:
        return "gray";
    }
  };

  const unreadCount =
    notifications?.data?.result?.filter((notif) => !notif.read).length || 0;
  const displayedNotifications = showAll
    ? notifications?.data?.result
    : notifications?.data?.result?.slice(0, 5);

  console.log(displayedNotifications);
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            defaultBg: "#a11d26",
            defaultColor: "#ffffff",
            defaultHoverBg: "#a11d26",
            defaultHoverColor: "#ffffff",
            defaultHoverBorderColor: "#a11d26",
            defaultActiveBg: "#a11d26",
            defaultActiveColor: "#ffffff",
            defaultActiveBorderColor: "none",
          },
        },
      }}
    >
      <div className="w-72 max-h-96 flex flex-col bg-black">
        {notificationLoading || updateLoading ? (
          <div className="p-4 text-center text-white">
            <Spin size="small" />
          </div>
        ) : displayedNotifications?.length > 0 ? (
          <>
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
              <h3 className="text-white font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="overflow-y-auto px-2 py-1">
              {displayedNotifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full min-h-16 flex items-start justify-between gap-3 p-3 my-1 rounded-md cursor-pointer hover:bg-gray-800 ${
                    !item.read ? "bg-gray-900" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center mt-1">
                      {item.type === "ORDER" ? "🛒" : "✉️"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        {item.type && (
                          <Tag color={getTypeColor(item.type)}>{item.type}</Tag>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-gray-300 text-xs whitespace-pre-line">
                        {item.message}
                      </p>
                      {item.read && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <CheckCircleOutlined className="mr-1" /> Read
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(item._id);
                      }}
                      className="text-gray-400 hover:text-white"
                      title="Mark as read"
                    >
                      <MdOutlineMarkEmailRead size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMessage(item._id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                      title="Delete"
                    >
                      <MdCancel size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 p-2 flex justify-between items-center">
              {notifications?.data?.result.length > 5 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  {showAll ? "Show less" : "Show more..."}
                </button>
              )}
              <Link to="/notification">
                <Button className="rounded-lg">See all</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col gap-1 items-center justify-center bg-black py-3 px-2">
            <img
              src={EmptyNotification}
              width={120}
              height={150}
              alt="No notifications"
            />
            <p className="font-medium text-base text-center text-white">
              There's no notifications
            </p>
            <p className="text-wrap text-center text-[12px] text-gray-400">
              Your notifications will appear here.
            </p>
            <Link to="/notification">
              <Button className="w-32 rounded-lg mt-2">See details</Button>
            </Link>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}

export default NotificationPopover;

