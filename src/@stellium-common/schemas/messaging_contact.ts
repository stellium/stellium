export interface MessagingContactSchema {
    name: string;
    last_message: string;
    timestamp: Date | number;
    unread_notifications: number;
    profile_image: string;
}
