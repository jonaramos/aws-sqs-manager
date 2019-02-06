import {
  DeleteMessageBatchResult,
  GetQueueUrlResult,
  ReceiveMessageResult,
  SendMessageBatchResult,
  SendMessageResult,
} from 'aws-sdk/clients/sqs';

export const deleteMessageBatchResult1: DeleteMessageBatchResult = {
  Failed: [],
  Successful: [{ Id: 'deleted-msg-1' }, { Id: 'deleted-msg-2' }],
};

export const deleteMessageBatchResult2: DeleteMessageBatchResult = {
  Failed: [
    {
      Code: 'e1',
      Id: 'failed-msg-1',
      Message: 'Message error explanation',
      SenderFault: true,
    },
    {
      Code: 'e2',
      Id: 'failed-msg-2',
      Message: 'Message error explanation',
      SenderFault: false,
    }   
  ],
  Successful: []
}

export const getQueueUrlResult1: GetQueueUrlResult = {
  QueueUrl: 'https://mocked.aws.queueurl',
};

export const receiveMessageResult1: ReceiveMessageResult = {
  Messages: [
    {
      Attributes: {
        SentTimestamp: '2019-01-01',
      },
      Body: 'Message body 1',
      MD5OfBody: '123123',
      MD5OfMessageAttributes: '12341234',
      MessageAttributes: {
        NumberAttributeName: {
          DataType: 'Number',
          StringValue: '2',
        },
        StringAttributeName: {
          DataType: 'String',
          StringValue: 'value-1',
        },
      },
      MessageId: 'msg-1',
      ReceiptHandle: 'receipt-1',
    },
    {
      Attributes: {
        SentTimestamp: '2019-01-01',
      },
      Body: 'Message body 2',
      MD5OfBody: '123123',
      MD5OfMessageAttributes: '12341234',
      MessageAttributes: {
        NumberAttributeName: {
          DataType: 'Number',
          StringValue: '2',
        },
        StringAttributeName: {
          DataType: 'String',
          StringValue: 'value-1',
        },
      },
      MessageId: 'msg-2',
      ReceiptHandle: 'receipt-1',
    },
  ],
};

export const sendMessageResult1: SendMessageResult = {
  MD5OfMessageAttributes: '142234141314141',
  MD5OfMessageBody: 'Message Body',
  MessageId: 'msg-1',
};

export const sendMessageBatchResult1: SendMessageBatchResult = {
  Failed: [],
  Successful: [
    {
      Id: 'batch-msg-1',
      MD5OfMessageAttributes: '1231231123',
      MD5OfMessageBody: '12312321312',
      MessageId: 'msg-1',
      SequenceNumber: '128128128128',
    },
    {
      Id: 'batch-msg-2',
      MD5OfMessageAttributes: '1231231123',
      MD5OfMessageBody: '12312321312',
      MessageId: 'msg-2',
      SequenceNumber: '128128128128',
    },
  ],
};
