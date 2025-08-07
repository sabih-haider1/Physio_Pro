
import type { NotificationItem } from '@/lib/types';

export let adminNotifications: NotificationItem[] = [
  { id: 'admin-init1', userId: 'admin_system', title: 'System Audit Log Enabled', description: 'Automated system logging is now active.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), isRead: true, type: 'info' },
  { id: 'admin-support-ticket-new', userId: 'admin_system', title: 'New Support Ticket', description: 'Patient John Doe submitted: "Cannot log in..."', timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(), isRead: false, type: 'warning', link: '/admin/support/tickets' },
];

export let clinicianNotifications: NotificationItem[] = [
   { id: 'clinician-init1', userId: 'doc_current', title: 'Welcome to PhysioPro!', description: 'Explore your dashboard and start managing patients.', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), isRead: true, type: 'success', link: '/clinician/dashboard' },
];

export let patientNotifications: NotificationItem[] = [
  { id: 'patient-init1', userId: 'p1_current', title: 'Your Account is Ready', description: 'Welcome to your PhysioPro patient portal.', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), isRead: true, type: 'success', link: '/patient/dashboard' },
];

const MAX_NOTIFICATIONS_PER_LIST = 20;

export const addAdminNotification = (notificationData: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead' | 'userId'>) => {
  const newNotification: NotificationItem = {
    ...notificationData,
    id: `admin-notify${Date.now()}`,
    userId: 'admin_system',
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  adminNotifications = [newNotification, ...adminNotifications].slice(0, MAX_NOTIFICATIONS_PER_LIST);
};

export const addClinicianNotification = (targetClinicianId: string, notificationData: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead' | 'userId'>) => {
  const newNotification: NotificationItem = {
    ...notificationData,
    id: `clinician-notify${Date.now()}`,
    userId: targetClinicianId,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  clinicianNotifications = [newNotification, ...clinicianNotifications].slice(0, MAX_NOTIFICATIONS_PER_LIST);
};

export const addPatientNotification = (targetPatientId: string, notificationData: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead' | 'userId'>) => {
  const newNotification: NotificationItem = {
    ...notificationData,
    id: `patient-notify${Date.now()}`,
    userId: targetPatientId,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  patientNotifications = [newNotification, ...patientNotifications].slice(0, MAX_NOTIFICATIONS_PER_LIST);
};
