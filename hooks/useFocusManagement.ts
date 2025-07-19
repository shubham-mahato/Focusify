import { useEffect, useRef, useCallback } from "react";

interface UseFocusManagementReturn {
  focusElement: (selector: string) => void;
  focusFirst: () => void;
  focusLast: () => void;
  trapFocus: (
    containerRef: React.RefObject<HTMLElement | HTMLDivElement | null>
  ) => () => void;
  announceToScreenReader: (message: string) => void;
}

export function useFocusManagement(): UseFocusManagementReturn {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Create screen reader announcement element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(announcement);
    announcementRef.current = announcement;

    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  // Focus specific element
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, []);

  // Focus first focusable element
  const focusFirst = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  }, []);

  // Focus last focusable element
  const focusLast = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;
    if (lastElement) {
      lastElement.focus();
    }
  }, []);

  // Trap focus within a container (for modals) - FIXED TO ACCEPT NULL
  const trapFocus = useCallback(
    (containerRef: React.RefObject<HTMLElement | HTMLDivElement | null>) => {
      const container = containerRef.current;
      if (!container) return () => {};

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e: Event) => {
        // Type guard to ensure it's a KeyboardEvent
        if (!(e instanceof KeyboardEvent) || e.key !== "Tab") return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      container.addEventListener("keydown", handleTabKey);

      // Focus first element when trap is activated
      firstElement?.focus();

      // Return cleanup function
      return () => {
        container.removeEventListener("keydown", handleTabKey);
      };
    },
    []
  );

  // Announce message to screen readers
  const announceToScreenReader = useCallback((message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;

      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = "";
        }
      }, 1000);
    }
  }, []);

  return {
    focusElement,
    focusFirst,
    focusLast,
    trapFocus,
    announceToScreenReader,
  };
}
