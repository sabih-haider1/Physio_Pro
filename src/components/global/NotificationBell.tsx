
"use client";

import { useState, useEffect } from 'react'; 
import type { NotificationItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, CircleAlert, InfoIcon, CheckCircleIcon, RefreshCcwIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationBellProps {
  notifications: NotificationItem[];
  onUpdateNotifications?: (updatedNotifications: NotificationItem[]) => void; 
}

export function NotificationBell({ notifications: initialNotifications, onUpdateNotifications }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  useEffect(() => {
    setNotifications(initialNotifications); 
  }, [initialNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    // Also mark as read in the source array if possible (for prototype persistence)
    const sourceNotification = initialNotifications.find(n => n.id === id);
    if (sourceNotification) {
      sourceNotification.isRead = true;
    }
    if (onUpdateNotifications) {
      onUpdateNotifications(updated); 
    }
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    // Also mark all as read in the source array
    initialNotifications.forEach(n => n.isRead = true);
    if (onUpdateNotifications) {
      onUpdateNotifications(updated); 
    }
  };
  
  const getIconForType = (type: NotificationItem['type']) => {
    switch(type) {
      case 'info': return <InfoIcon className="h-4 w-4 text-blue-500" />;
      case 'warning': return <CircleAlert className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'error': return <CircleAlert className="h-4 w-4 text-red-500" />;
      case 'update': return <RefreshCcwIcon className="h-4 w-4 text-purple-500" />;
      case 'payment': return <CheckCircleIcon className="h-4 w-4 text-emerald-500" />; // Added payment
      default: return <InfoIcon className="h-4 w-4 text-gray-500" />;
    }
  };


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 w-8 group-data-[collapsible=icon]:mx-auto"
          aria-label="Toggle notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-medium text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={handleMarkAllAsRead}>
               <CheckCheck className="mr-1 h-3 w-3" /> Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-accent/50", 
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                     <span className="mt-0.5 shrink-0">{getIconForType(notification.type)}</span>
                    <div className="flex-grow">
                        {notification.link ? (
                             <Link href={notification.link} className="block hover:underline" onClick={() => {handleMarkAsRead(notification.id); setOpen(false);}}>
                                <p className={cn("text-sm font-medium leading-tight", !notification.isRead && "text-primary")}>{notification.title}</p>
                             </Link>
                        ) : (
                             <p className={cn("text-sm font-medium leading-tight", !notification.isRead && "text-primary")} onClick={() => handleMarkAsRead(notification.id)}>{notification.title}</p>
                        )}
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" title="Unread"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 text-center border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => {alert("Viewing all notifications (not implemented)."); setOpen(false);}}>View All Notifications</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
