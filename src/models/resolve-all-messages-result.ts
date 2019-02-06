import { BatchResultErrorEntryList, DeleteMessageBatchResultEntryList, MessageList } from 'aws-sdk/clients/sqs';
/** Represents a ResolveAllMessages method's result */
export interface ResolveAllMessagesResult {
  /** List of failed batch result entries */
  failedDeletes: BatchResultErrorEntryList;
  /** Received Messages */
  messages: MessageList;
  /** A list of successfully retrieved and deleted messages */
  successfulDeletes: DeleteMessageBatchResultEntryList
}