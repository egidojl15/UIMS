// src/components/NotificationSystem.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
} from "lucide-react";

const NotificationSystem = ({ notifications, onRemove }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [progressWidths, setProgressWidths] = useState({});

  // Ref to track which notifications have started their auto-dismiss timer
  const startedTimersRef = useRef(new Set());
  // Ref to track timeouts for proper cleanup
  const timersRef = useRef(new Map());

  useEffect(() => {
    console.log("NotificationSystem received notifications:", notifications);
    setVisibleNotifications(notifications);
  }, [notifications]);

  // Start auto-dismiss timer ONLY for NEW notifications (no dep on progressWidths to avoid loop)
  useEffect(() => {
    visibleNotifications.forEach((notification) => {
      if (
        notification.autoDismiss &&
        !startedTimersRef.current.has(notification.id)
      ) {
        // Mark as started
        startedTimersRef.current.add(notification.id);

        // Set initial progress
        setProgressWidths((prev) => ({ ...prev, [notification.id]: 100 }));

        // Small delay to trigger animation, then fade progress to 0
        const fadeTimer = setTimeout(() => {
          setProgressWidths((prev) => ({ ...prev, [notification.id]: 0 }));
        }, 10);

        // Remove after 5 seconds
        const removeTimer = setTimeout(() => {
          handleRemove(notification.id);
        }, 5000);

        // Store timeouts for cleanup
        timersRef.current.set(notification.id, { fadeTimer, removeTimer });
      }
    });

    // Cleanup all timers on unmount or effect re-run
    return () => {
      timersRef.current.forEach(({ fadeTimer, removeTimer }) => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      });
      timersRef.current.clear();
      startedTimersRef.current.clear();
    };
  }, [visibleNotifications]); // <-- FIXED: Only depend on visibleNotifications (new notifs trigger this)

  const handleRemove = (id) => {
    // Clear any pending timers for this notification
    const timers = timersRef.current.get(id);
    if (timers) {
      clearTimeout(timers.fadeTimer);
      clearTimeout(timers.removeTimer);
      timersRef.current.delete(id);
    }

    setVisibleNotifications((prev) => prev.filter((notif) => notif.id !== id));
    setProgressWidths((prev) => {
      const newPrev = { ...prev };
      delete newPrev[id];
      return newPrev;
    });
    startedTimersRef.current.delete(id);
    onRemove(id);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationStyle = (type) => {
    const baseStyles =
      "relative p-6 rounded-xl shadow-2xl border-l-4 mb-2 transform transition-all duration-300 ease-in-out animate-slideInRight max-w-md w-full bg-white ring-2 ring-gray-200";

    switch (type) {
      case "success":
        return `${baseStyles} border-green-400 text-green-800 shadow-green-500/20`;
      case "error":
        return `${baseStyles} border-red-400 text-red-800 shadow-red-500/20`;
      case "warning":
        return `${baseStyles} border-yellow-400 text-yellow-800 shadow-yellow-500/20 animate-pulse`;
      case "info":
        return `${baseStyles} border-blue-400 text-blue-800 shadow-blue-500/20`;
      default:
        return `${baseStyles} border-gray-400 text-gray-800 shadow-gray-500/20`;
    }
  };

  // Determine if this notification should be centered (e.g., has action like confirmation)
  const isCentered = (notification) => !!notification.action;

  console.log(
    "NotificationSystem rendering with visibleNotifications:",
    visibleNotifications
  );
  console.log(
    "NotificationSystem - isCentered notifications:",
    visibleNotifications.filter(isCentered)
  );
  console.log(
    "NotificationSystem - regular notifications:",
    visibleNotifications.filter((notification) => !isCentered(notification))
  );

  if (visibleNotifications.length === 0) {
    console.log("NotificationSystem - No notifications to render");
    return null;
  }

  return (
    <>
      {/* Stacked notifications in top-right for non-centered */}
      <div className="fixed top-20 right-4 z-[99999999] max-w-sm w-full space-y-2 pointer-events-auto">
        {visibleNotifications
          .filter((notification) => !isCentered(notification))
          .map((notification) => (
            <div
              key={notification.id}
              className={getNotificationStyle(notification.type)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{notification.title}</p>
                  {notification.message && (
                    <p className="text-sm mt-1 opacity-90">
                      {notification.message}
                    </p>
                  )}
                  {notification.action && (
                    <div className="mt-2">{notification.action}</div>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(notification.id)}
                  className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar for auto-dismiss */}
              {notification.autoDismiss && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20 rounded-b-lg">
                  <div
                    className="h-full bg-current transition-all duration-5000 ease-linear rounded-b-lg"
                    style={{
                      width: `${progressWidths[notification.id] || 100}%`,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Centered notifications (e.g., confirmations) */}
      {visibleNotifications.filter(isCentered).map((notification) => (
        <div
          key={notification.id}
          className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black bg-opacity-50"
        >
          <div
            className={`${getNotificationStyle(
              notification.type
            )} mx-auto max-w-lg w-full p-8 shadow-2xl ring-4 ring-gray-200`}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold mb-2">
                  {notification.title}
                </p>
                {notification.message && (
                  <p className="text-base leading-relaxed">
                    {notification.message}
                  </p>
                )}
                {notification.action && (
                  <div className="mt-4">{notification.action}</div>
                )}
              </div>
              <button
                onClick={() => handleRemove(notification.id)}
                className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* No progress bar for centered/confirmation */}
          </div>
        </div>
      ))}

      {/* Add CSS animations */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default NotificationSystem;
