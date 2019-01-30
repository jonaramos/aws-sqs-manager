import { DeleteMessageBatchResult, ReceiveMessageResult } from 'aws-sdk/clients/sqs';

export interface ResolveMessageResult {
  deleteMessageResult: DeleteMessageBatchResult,
  receiveMessageResult: ReceiveMessageResult 
}