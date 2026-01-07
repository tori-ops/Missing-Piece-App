import { prisma } from '@/lib/prisma';
import { Tenant } from '@prisma/client';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(userId: string) {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  // Default preferences if none exist
  return prefs || {
    userId,
    emailOnTaskCreated: true,
    emailOnTaskCompleted: true,
    emailOnTaskCommented: true,
    emailOnMeetingNoteCreated: true,
    emailOnMeetingNoteCommented: false,
  };
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    notificationsEnabled?: boolean;
    emailOnTaskCreated?: boolean;
    emailOnTaskCompleted?: boolean;
    emailOnTaskCommented?: boolean;
    emailOnMeetingNoteCreated?: boolean;
    emailOnMeetingNoteCommented?: boolean;
  }
) {
  // Filter out undefined values to only update provided fields
  const updateData = Object.fromEntries(
    Object.entries(preferences).filter(([, value]) => value !== undefined)
  );

  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId, ...preferences },
    update: updateData,
  });
}

/**
 * Generate branded HTML email template
 */
export function generateBrandedEmailTemplate(
  tenant: Tenant,
  subject: string,
  content: string,
  actionUrl?: string,
  actionText?: string
): EmailTemplate {
  const primaryColor = tenant.brandingPrimaryColor || '#274E13';
  const secondaryColor = tenant.brandingSecondaryColor || '#e1e0d0';
  const fontColor = tenant.brandingFontColor || '#1B5E20';
  const companyName = tenant.brandingCompanyName || tenant.businessName || 'The Missing Piece';
  const logoUrl = tenant.brandingLogoUrl;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      line-height: 1.6;
      color: ${fontColor};
      background-color: ${secondaryColor};
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 2px solid ${primaryColor};
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: ${primaryColor};
      color: #ffffff;
      padding: 2rem;
      text-align: center;
      border-radius: 6px 6px 0 0;
    }
    .header img {
      max-height: 60px;
      margin-bottom: 1rem;
    }
    .header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }
    .content {
      padding: 2rem;
    }
    .content p {
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
    }
    .action-button {
      display: inline-block;
      background-color: ${primaryColor};
      color: #ffffff;
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 1.5rem 0;
      font-size: 0.9rem;
    }
    .action-button:hover {
      opacity: 0.9;
    }
    .footer {
      background-color: ${secondaryColor}40;
      padding: 1.5rem;
      text-align: center;
      border-radius: 0 0 6px 6px;
      font-size: 0.85rem;
      color: #666;
    }
    .footer a {
      color: ${primaryColor};
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: ${primaryColor}20;
      margin: 2rem 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" />` : ''}
      <h1>${companyName}</h1>
    </div>
    
    <div class="content">
      ${content}
      ${
        actionUrl && actionText
          ? `<a href="${actionUrl}" class="action-button">${actionText}</a>`
          : ''
      }
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 1rem 0;">
        You received this email because you're part of the ${companyName} team.
      </p>
      <p style="margin: 0;">
        <a href="[UNSUBSCRIBE_URL]">Manage notification preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${companyName}

${subject}

${content}

${actionUrl ? `Open: ${actionUrl}` : ''}

---
You received this email because you're part of the ${companyName} team.
Manage notification preferences: [UNSUBSCRIBE_URL]
  `;

  return {
    subject: `${companyName} - ${subject}`,
    html,
    text,
  };
}

/**
 * Log a notification event
 */
export async function logNotification(
  userId: string,
  type: 'task_created' | 'task_completed' | 'task_commented' | 'meeting_note_created' | 'meeting_note_commented',
  relatedTaskId?: string,
  relatedMeetingNoteId?: string,
  relatedCommentId?: string
) {
  return prisma.notificationLog.create({
    data: {
      recipientUserId: userId,
      recipientEmail: '', // Will be fetched from user in actual implementation
      notificationType: type,
      subject: '', // Will be set based on notification type
      taskId: relatedTaskId,
      meetingNoteId: relatedMeetingNoteId,
      commentId: relatedCommentId,
    },
  });
}

/**
 * Check if user should receive notification
 */
export async function shouldSendNotification(
  userId: string,
  type: 'task_created' | 'task_completed' | 'task_commented' | 'meeting_note_created' | 'meeting_note_commented'
): Promise<boolean> {
  const prefs = await getUserNotificationPreferences(userId);

  switch (type) {
    case 'task_created':
      return prefs.emailOnTaskCreated;
    case 'task_completed':
      return prefs.emailOnTaskCompleted;
    case 'task_commented':
      return prefs.emailOnTaskCommented;
    case 'meeting_note_created':
      return prefs.emailOnMeetingNoteCreated;
    case 'meeting_note_commented':
      return prefs.emailOnMeetingNoteCommented;
    default:
      return true;
  }
}

/**
 * Queue an email for sending (placeholder - integrate with your email service)
 * This would integrate with services like SendGrid, Postmark, AWS SES, etc.
 */
export async function queueEmail(
  toEmail: string,
  subject: string,
  _htmlContent: string,
  _textContent: string,
  userId: string,
  notificationType: 'task_created' | 'task_completed' | 'task_commented' | 'meeting_note_created' | 'meeting_note_commented',
  relatedTaskId?: string,
  relatedMeetingNoteId?: string,
  relatedCommentId?: string
) {
  // Log the notification event
  await logNotification(userId, notificationType, relatedTaskId, relatedMeetingNoteId, relatedCommentId);

  // TODO: Integrate with your email service provider here
  // Example: await sendGridClient.send({
  //   to: toEmail,
  //   from: 'noreply@themissingpiece.com',
  //   subject,
  //   html: _htmlContent,
  //   text: _textContent,
  // });

  // For now, log to console
  console.log(`[EMAIL QUEUED] To: ${toEmail}, Subject: ${subject}`);
}

/**
 * Create a notification log entry for a user
 * Used for in-app notifications about tasks
 */
export async function createNotificationLog(
  taskId: string,
  userId: string,
  notificationType: 'task_assigned' | 'task_completed' | 'due_date_warning' | 'task_reassigned'
) {
  try {
    const notification = await prisma.notificationLog.create({
      data: {
        taskId,
        userId,
        notificationType,
        isRead: false,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification log:', error);
    throw error;
  }
}

/**
 * Get unread notifications for a user
 */
export async function getUserNotifications(userId: string, limit = 20) {
  try {
    const notifications = await prisma.notificationLog.findMany({
      where: { userId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notificationLog.count({
      where: { userId, isRead: false },
    });
    return count;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notificationLog.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.notificationLog.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  try {
    const notification = await prisma.notificationLog.delete({
      where: { id: notificationId },
    });
    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// ============================================================================
// TASK NOTIFICATIONS (In-App Real-Time Notifications)
// ============================================================================

/**
 * Create task notifications when task is assigned to client and/or tenant users
 */
export async function createTaskNotifications(
  taskId: string,
  assignedToClientId?: string,
  assignedToTenantId?: string,
  notificationType: 'task_assigned' | 'task_reassigned' = 'task_assigned'
) {
  try {
    const notifications = [];
    
    // Create notification for assigned client user
    if (assignedToClientId) {
      const clientNotif = await prisma.taskNotification.upsert({
        where: {
          taskId_userId_notificationType: {
            taskId,
            userId: assignedToClientId,
            notificationType,
          },
        },
        create: {
          taskId,
          userId: assignedToClientId,
          notificationType,
          isRead: false,
        },
        update: {
          isRead: false,
          createdAt: new Date(),
        },
      });
      notifications.push(clientNotif);
    }
    
    // Create notification for assigned tenant user
    if (assignedToTenantId) {
      const tenantNotif = await prisma.taskNotification.upsert({
        where: {
          taskId_userId_notificationType: {
            taskId,
            userId: assignedToTenantId,
            notificationType,
          },
        },
        create: {
          taskId,
          userId: assignedToTenantId,
          notificationType,
          isRead: false,
        },
        update: {
          isRead: false,
          createdAt: new Date(),
        },
      });
      notifications.push(tenantNotif);
    }
    
    return notifications;
  } catch (error) {
    console.error('Error creating task notifications:', error);
    throw error;
  }
}

/**
 * Clear all notifications for a task (when task is completed or deleted)
 */
export async function clearTaskNotifications(taskId: string) {
  try {
    await prisma.taskNotification.deleteMany({
      where: { taskId },
    });
  } catch (error) {
    console.error('Error clearing task notifications:', error);
    throw error;
  }
}

/**
 * Get unread task notifications for a user
 */
export async function getUnreadTaskNotificationCount(userId: string): Promise<number> {
  try {
    const count = await prisma.taskNotification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    console.error('Error getting unread task notification count:', error);
    throw error;
  }
}

/**
 * Get task notifications for a user
 */
export async function getTaskNotifications(userId: string, limit: number = 50) {
  try {
    const notifications = await prisma.taskNotification.findMany({
      where: { userId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            assignedToClientId: true,
            assignedToTenantId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications;
  } catch (error) {
    console.error('Error getting task notifications:', error);
    throw error;
  }
}

/**
 * Mark task notification as read
 */
export async function markTaskNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.taskNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return notification;
  } catch (error) {
    console.error('Error marking task notification as read:', error);
    throw error;
  }
}

/**
 * Mark all task notifications as read for a user
 */
export async function markAllTaskNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.taskNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result;
  } catch (error) {
    console.error('Error marking all task notifications as read:', error);
    throw error;
  }
}

