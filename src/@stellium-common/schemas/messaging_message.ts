export interface MessagingMessageSchema {
    message: string;
    from_id: string;
    to_id: string;
    outgoing: boolean;
    timestamp: Date | number;
}
