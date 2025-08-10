import { Logger } from '../utils/logger';

export interface JobData {
  [key: string]: any;
}

export interface JobOptions {
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface Job {
  id: string;
  type: string;
  data: JobData;
  options: JobOptions;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  attempts: number;
  error?: string;
}

/**
 * Queue Service for background job processing
 * This is a simplified in-memory queue. In production, use Redis-based queues like Bull or Agenda
 */
export class QueueService {
  private static instance: QueueService;
  private queues: Map<string, Job[]>;
  private processors: Map<string, (job: Job) => Promise<void>>;
  private logger: Logger;
  private isProcessing: boolean = false;
  private processingInterval?: NodeJS.Timeout;

  private constructor() {
    this.queues = new Map();
    this.processors = new Map();
    this.logger = Logger.getInstance();
    this.initializeQueues();
    this.startProcessing();
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  private initializeQueues(): void {
    // Initialize different queue types
    const queueTypes = ['email', 'sms', 'analytics', 'booking', 'payment', 'notification'];
    queueTypes.forEach(type => {
      this.queues.set(type, []);
    });

    // Register default processors
    this.registerProcessors();
  }

  private registerProcessors(): void {
    // Email processor
    this.processors.set('email', async (job: Job) => {
      this.logger.info('Processing email job', { jobId: job.id, jobType: job.type, data: job.data });
      
      switch (job.data.type) {
        case 'booking-confirmation':
          await this.processBookingConfirmationEmail(job.data);
          break;
        case 'payment-confirmation':
          await this.processPaymentConfirmationEmail(job.data);
          break;
        case 'booking-cancellation':
          await this.processBookingCancellationEmail(job.data);
          break;
        default:
          throw new Error(`Unknown email job type: ${job.data.type}`);
      }
    });

    // SMS processor
    this.processors.set('sms', async (job: Job) => {
      this.logger.info('Processing SMS job', { jobId: job.id, jobType: job.type });
      
      switch (job.data.type) {
        case 'booking-confirmation':
          await this.processBookingConfirmationSMS(job.data);
          break;
        case 'payment-reminder':
          await this.processPaymentReminderSMS(job.data);
          break;
        default:
          throw new Error(`Unknown SMS job type: ${job.data.type}`);
      }
    });

    // Analytics processor
    this.processors.set('analytics', async (job: Job) => {
      this.logger.info('Processing analytics job', { jobId: job.id, jobType: job.type });
      
      switch (job.data.type) {
        case 'booking-created':
          await this.processBookingAnalytics(job.data);
          break;
        case 'payment-completed':
          await this.processPaymentAnalytics(job.data);
          break;
        default:
          this.logger.warn('Unknown analytics job type', { type: job.data.type });
      }
    });

    // Booking processor
    this.processors.set('booking', async (job: Job) => {
      this.logger.info('Processing booking job', { jobId: job.id, jobType: job.type });
      
      switch (job.data.type) {
        case 'auto-cancel-check':
          await this.processAutoCancelCheck(job.data);
          break;
        case 'seat-release':
          await this.processSeatRelease(job.data);
          break;
        default:
          throw new Error(`Unknown booking job type: ${job.data.type}`);
      }
    });

    // Notification processor
    this.processors.set('notification', async (job: Job) => {
      this.logger.info('Processing notification job', { jobId: job.id, jobType: job.type });
      
      switch (job.data.type) {
        case 'booking-status-change':
          await this.processBookingStatusNotification(job.data);
          break;
        case 'payment-status-change':
          await this.processPaymentStatusNotification(job.data);
          break;
        default:
          this.logger.warn('Unknown notification job type', { type: job.data.type });
      }
    });
  }

  /**
   * Add job to queue
   */
  async addJob(
    queueName: string,
    jobType: string,
    data: JobData,
    options: JobOptions = {}
  ): Promise<string> {
    const job: Job = {
      id: `${queueName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: jobType,
      data: { ...data, type: jobType },
      options: {
        attempts: 3,
        priority: 'normal',
        ...options
      },
      createdAt: new Date(),
      attempts: 0
    };

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    // Add job to queue based on priority and delay
    if (options.delay && options.delay > 0) {
      setTimeout(() => {
        this.insertJobByPriority(queue, job);
        this.logger.debug('Delayed job added to queue', { jobId: job.id, queueName, delay: options.delay });
      }, options.delay);
    } else {
      this.insertJobByPriority(queue, job);
    }

    this.logger.debug('Job added to queue', { jobId: job.id, queueName, jobType });
    return job.id;
  }

  /**
   * Insert job into queue based on priority
   */
  private insertJobByPriority(queue: Job[], job: Job): void {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const jobPriority = priorityOrder[job.options.priority || 'normal'];

    let insertIndex = queue.length;
    for (let i = 0; i < queue.length; i++) {
      const currentJob = queue[i];
      if (!currentJob || !currentJob.options) continue;
      
      const existingPriority = priorityOrder[currentJob.options.priority || 'normal'];
      if (jobPriority < existingPriority) {
        insertIndex = i;
        break;
      }
    }

    queue.splice(insertIndex, 0, job);
  }

  /**
   * Start processing jobs
   */
  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.processingInterval = setInterval(async () => {
      await this.processJobs();
    }, 1000); // Process every second

    this.logger.info('Queue processing started');
  }

  /**
   * Stop processing jobs
   */
  async stopProcessing(): Promise<void> {
    this.isProcessing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    this.logger.info('Queue processing stopped');
  }

  /**
   * Process jobs from all queues
   */
  private async processJobs(): Promise<void> {
    for (const [queueName, queue] of this.queues) {
      const processor = this.processors.get(queueName);
      if (!processor || queue.length === 0) continue;

      const job = queue.shift();
      if (!job) continue;

      try {
        job.processedAt = new Date();
        job.attempts++;

        await processor(job);

        job.completedAt = new Date();
        this.logger.debug('Job completed successfully', { jobId: job.id, queueName });

      } catch (error: any) {
        job.error = error.message;
        job.failedAt = new Date();

        this.logger.error('Job failed', {
          jobId: job.id,
          queueName,
          attempt: job.attempts,
          error: error.message
        });

        // Retry logic
        if (job.attempts < (job.options.attempts || 3)) {
          const delay = this.calculateRetryDelay(job);
          setTimeout(() => {
            queue.push(job);
            this.logger.info('Job queued for retry', { jobId: job.id, attempt: job.attempts + 1, delay });
          }, delay);
        } else {
          this.logger.error('Job failed permanently', { jobId: job.id, queueName });
        }
      }
    }
  }

  /**
   * Calculate retry delay based on backoff strategy
   */
  private calculateRetryDelay(job: Job): number {
    const backoff = job.options.backoff || { type: 'exponential', delay: 1000 };
    
    if (backoff.type === 'exponential') {
      return backoff.delay * Math.pow(2, job.attempts - 1);
    } else {
      return backoff.delay;
    }
  }

  /**
   * Get queue stats
   */
  getQueueStats(): Record<string, { pending: number, processing: number }> {
    const stats: Record<string, { pending: number, processing: number }> = {};
    
    for (const [queueName, queue] of this.queues) {
      stats[queueName] = {
        pending: queue.filter(job => !job.processedAt).length,
        processing: queue.filter(job => job.processedAt && !job.completedAt && !job.failedAt).length
      };
    }
    
    return stats;
  }

  // Job processors implementation
  private async processBookingConfirmationEmail(data: JobData): Promise<void> {
    // Implement email sending logic
    this.logger.info('Sending booking confirmation email', { bookingId: data.bookingId });
    // await emailService.sendBookingConfirmation(data.bookingId);
  }

  private async processPaymentConfirmationEmail(data: JobData): Promise<void> {
    this.logger.info('Sending payment confirmation email', { paymentId: data.paymentId });
    // await emailService.sendPaymentConfirmation(data.paymentId);
  }

  private async processBookingCancellationEmail(data: JobData): Promise<void> {
    this.logger.info('Sending booking cancellation email', { bookingId: data.bookingId });
    // await emailService.sendBookingCancellation(data.bookingId);
  }

  private async processBookingConfirmationSMS(data: JobData): Promise<void> {
    this.logger.info('Sending booking confirmation SMS', { bookingId: data.bookingId });
    // await smsService.sendBookingConfirmation(data.bookingId);
  }

  private async processPaymentReminderSMS(data: JobData): Promise<void> {
    this.logger.info('Sending payment reminder SMS', { bookingId: data.bookingId });
    // await smsService.sendPaymentReminder(data.bookingId);
  }

  private async processBookingAnalytics(data: JobData): Promise<void> {
    this.logger.info('Processing booking analytics', { bookingId: data.bookingId });
    // await analyticsService.trackBookingCreated(data);
  }

  private async processPaymentAnalytics(data: JobData): Promise<void> {
    this.logger.info('Processing payment analytics', { paymentId: data.paymentId });
    // await analyticsService.trackPaymentCompleted(data);
  }

  private async processAutoCancelCheck(data: JobData): Promise<void> {
    this.logger.info('Checking auto-cancel for booking', { bookingId: data.bookingId });
    // await bookingService.checkAutoCancelBooking(data.bookingId);
  }

  private async processSeatRelease(data: JobData): Promise<void> {
    this.logger.info('Releasing seats', { bookingId: data.bookingId });
    // await bookingService.releaseSeats(data.bookingId);
  }

  private async processBookingStatusNotification(data: JobData): Promise<void> {
    this.logger.info('Processing booking status notification', { bookingId: data.bookingId });
    // await notificationService.sendBookingStatusChange(data);
  }

  private async processPaymentStatusNotification(data: JobData): Promise<void> {
    this.logger.info('Processing payment status notification', { paymentId: data.paymentId });
    // await notificationService.sendPaymentStatusChange(data);
  }
}
