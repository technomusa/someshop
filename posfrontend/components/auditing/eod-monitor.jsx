"use client";

import { useEffect, useState } from "react";
import { useFinanceStore } from "@/lib/finance-store";
import { usePOSStore } from "@/lib/store";
import { useSettingsStore } from "@/lib/settings-store";
import { toast } from "sonner";
import { AlertTriangle, Bell } from "lucide-react";

export function EODMonitor() {
  const { checkEODStatus, createMissedClosureAlert, getActiveAlerts, markAlertNotified } = useFinanceStore();
  const { currentUser, addNotification } = usePOSStore();
  const { users } = useSettingsStore();
  const [lastCheck, setLastCheck] = useState(new Date());
  
  // Get admin users
  const admins = users.filter((u) => u.role === "admin" && u.isActive);
  
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const status = checkEODStatus();
      const now = new Date();
      const hour = now.getHours();
      
      // Check if we're past the deadline (default 11:59 PM)
      if (!status.isClosed && status.isOverdue) {
        const today = new Date().toISOString().split("T")[0];
        const alert = createMissedClosureAlert(today);
        
        // Notify admin users if not already notified
        if (!alert.notified && admins.length > 0) {
          admins.forEach((admin) => {
            addNotification({
              type: "critical",
              title: "Missed End-of-Day Closure",
              message: `Daily closure for ${today} has not been completed. Immediate action required.`,
              action: {
                label: "Go to Auditing",
                href: "/auditing"
              }
            });
          });
          
          markAlertNotified(alert.id);
          
          // Show toast to current user if they're not admin
          if (currentUser?.role !== "admin") {
            toast.error("End-of-day closure is overdue! Admin has been notified.", {
              duration: 10000,
              action: {
                label: "Close Now",
                onClick: () => window.location.href = "/auditing"
              }
            });
          } else {
            toast.error("End-of-day closure is overdue! Please close accounts immediately.", {
              duration: 10000,
              action: {
                label: "Close Now",
                onClick: () => window.location.href = "/auditing"
              }
            });
          }
        }
      }
      
      // Check every 5 minutes if we're close to deadline (after 11 PM)
      if (hour >= 23 && !status.isClosed) {
        toast.warning("End-of-day closure deadline approaching. Please prepare to close accounts.", {
          duration: 5000
        });
      }
      
      setLastCheck(new Date());
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    // Initial check
    const status = checkEODStatus();
    if (!status.isClosed && status.isOverdue) {
      const today = new Date().toISOString().split("T")[0];
      createMissedClosureAlert(today);
    }
    
    return () => clearInterval(checkInterval);
  }, [checkEODStatus, createMissedClosureAlert, getActiveAlerts, markAlertNotified, addNotification, admins, currentUser]);
  
  // Check for active alerts and notify admins
  useEffect(() => {
    const activeAlerts = getActiveAlerts();
    if (activeAlerts.length > 0 && admins.length > 0) {
      activeAlerts.forEach((alert) => {
        if (!alert.notified) {
          admins.forEach((admin) => {
            addNotification({
              type: "critical",
              title: "Missed Closure Alert",
              message: `Daily closure for ${alert.date} was not completed. Financial audit required.`,
              action: {
                label: "Review",
                href: "/auditing"
              }
            });
          });
          markAlertNotified(alert.id);
        }
      });
    }
  }, [getActiveAlerts, admins, addNotification, markAlertNotified]);
  
  return null; // This is a background monitoring component
}

