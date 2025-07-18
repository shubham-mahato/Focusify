import { useState, useCallback, useEffect } from "react";
import { TimerMode } from "../types/timer";

type NotificationPermission = "default" | "granted" | "denied";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (options: NotificationOptions) => void;
  showSessionComplete: (mode: TimerMode, nextMode: TimerMode) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  // Initialize support and permission state (client-side only)
  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== "undefined") {
      const supported = "Notification" in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission as NotificationPermission);
      }
    }
  }, []);

  // Request notification permission
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      // Check if we're in browser and notifications are supported
      if (typeof window === "undefined" || !("Notification" in window)) {
        return "denied";
      }

      try {
        const result = await Notification.requestPermission();
        setPermission(result as NotificationPermission);
        return result as NotificationPermission;
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return "denied";
      }
    }, []);

  // Show a notification
  const showNotification = useCallback(
    (options: NotificationOptions) => {
      // Check if we're in browser and have permission
      if (
        typeof window === "undefined" ||
        !("Notification" in window) ||
        permission !== "granted"
      ) {
        console.log("Notifications not available or not permitted");
        return;
      }

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/favicon.ico",
          badge: options.badge || "/favicon.ico",
          tag: options.tag || "focusify",
          requireInteraction: options.requireInteraction || false,
          silent: false,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    [permission]
  );

  // Show session complete notification
  const showSessionComplete = useCallback(
    (mode: TimerMode, nextMode: TimerMode) => {
      const messages = {
        focus: {
          title: "🍅 Focus Session Complete!",
          body: `Great work! Time for a ${
            nextMode === "long-break" ? "long" : "short"
          } break.`,
        },
        "short-break": {
          title: "☕ Break Over!",
          body: "Ready to get back to focused work?",
        },
        "long-break": {
          title: "🌟 Long Break Complete!",
          body: "Refreshed and ready for a new cycle!",
        },
      };

      const message = messages[mode];

      showNotification({
        title: message.title,
        body: message.body,
        tag: `session-complete-${mode}`,
        requireInteraction: true,
      });
    },
    [showNotification]
  );

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    showSessionComplete,
  };
}
