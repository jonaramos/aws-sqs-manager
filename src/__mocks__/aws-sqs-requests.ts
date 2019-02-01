import {
  DeleteMessageBatchRequestEntryList,
  MessageAttributeValue,
  ReceiveMessageRequest,
  SendMessageBatchRequestEntry,
  SendMessageRequest,
} from 'aws-sdk/clients/sqs';

export const deleteMessageBatchRequestEntryList1: DeleteMessageBatchRequestEntryList = [
  {
    Id: 'msg-1',
    ReceiptHandle: 'receipt-1',
  },
];

export const messageAttributeValueString: MessageAttributeValue = {
  DataType: 'String',
  StringValue: 'StringValue1',
};

export const messageAttributeValueNumber: MessageAttributeValue = {
  DataType: 'Number',
  StringValue: '1',
};

export const receiveMessageRequest1: ReceiveMessageRequest = {
  AttributeNames: ['SentTimestamp'],
  MaxNumberOfMessages: 2,
  MessageAttributeNames: ['StringAttributeName', 'NumberAttributeName'],
  QueueUrl: '',
};

export const sendMessageRequest1: SendMessageRequest = {
  MessageAttributes: {
    attribute1: messageAttributeValueString,
    attribute2: messageAttributeValueNumber,
  },
  MessageBody: 'Message body',
  QueueUrl: '',
};

export const sendMessageBatchRequestEntry1: SendMessageBatchRequestEntry = {
  DelaySeconds: 0,
  Id: 'batch-msg-1',
  MessageAttributes: {
    attribute1: messageAttributeValueString,
    attribute2: messageAttributeValueNumber,
  },
  MessageBody: 'MsgBody1',
};

export const sendMessageBatchRequestEntry2: SendMessageBatchRequestEntry = {
  DelaySeconds: 0,
  Id: 'batch-msg-2',
  MessageAttributes: {
    attribute1: {
      DataType: 'String',
      StringValue: 'StringValue1',
    },
    attribute2: {
      DataType: 'Number',
      StringValue: '1',
    },
  },
  MessageBody: 'MsgBody2',
};
