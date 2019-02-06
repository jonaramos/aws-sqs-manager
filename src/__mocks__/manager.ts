import { DeleteMessageResult, ResolveAllMessagesRequest, ResolveAllMessagesResult, ResolveMessageResult } from '../models';
import { deleteMessageBatchResult1, deleteMessageBatchResult2, receiveMessageResult1 } from './aws-sqs-results';

export const deleteMessageRequest1 = 'receipt-1';

export const deleteMessageResult1: DeleteMessageResult = {
  RequestId: 'requestId',
};

export const resolveAllMessagesRequest1: ResolveAllMessagesRequest = {
  attributesNames: ['All'],
  messagesAttributesNames: ['All'],
  messagesTotal: 2,
  pollingTimeout: 30,
  visibilityTimeout: 30,
  waitTimeSeconds: 20
};

export const resolveAllMessagesResult1: ResolveAllMessagesResult = {
  failedDeletes: deleteMessageBatchResult1.Failed,
  messages: receiveMessageResult1.Messages!,
  successfulDeletes: deleteMessageBatchResult1.Successful
}

export const resolveAllMessagesResult2: ResolveAllMessagesResult = {
  failedDeletes: deleteMessageBatchResult2.Failed,
  messages: receiveMessageResult1.Messages!,
  successfulDeletes: deleteMessageBatchResult2.Successful
}

export const resolveMessageResult1: ResolveMessageResult = {
  deleteMessageResult: deleteMessageBatchResult1,
  receiveMessageResult: receiveMessageResult1,
};
