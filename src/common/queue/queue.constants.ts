export const QUEUE_NAMES = {
  QUEUE_LIFECYCLE: 'queue-lifecycle',
  NOTIFICATIONS: 'notifications',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const QUEUE_JOBS = {
  CHECK_NO_SHOW: 'check-ticket-no-show',
  RELEASE_UNPAID_BOOKING: 'release-unpaid-booking',
  REMIND_UPCOMING_BOOKING: 'remind-upcoming-booking',
  SEND_NOTIFICATION: 'send-notification',
} as const;

export type QueueJobName = (typeof QUEUE_JOBS)[keyof typeof QUEUE_JOBS];
