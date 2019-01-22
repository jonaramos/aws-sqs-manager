import { DeleteMessageBatchResult, MessageList } from 'aws-sdk/clients/sqs';

export interface ReceiveDeleteMessageResponse {
  DeleteResult: DeleteMessageBatchResult;
  Messages: MessageList;
}