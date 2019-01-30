import { DeleteMessageResult, ResolveMessageResult } from '../models';
import { deleteMessageBatchResult1, receiveMessageResult1 } from './aws-sqs-results';

export const deleteMessageRequest1 = 'receipt-1';

export const deleteMessageResult1: DeleteMessageResult = {
  RequestId: 'requestId',
};

export const resolveMessageResult1: ResolveMessageResult = {
  deleteMessageResult: deleteMessageBatchResult1,
  receiveMessageResult: receiveMessageResult1,
};
