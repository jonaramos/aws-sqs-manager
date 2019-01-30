import * as AWS from 'aws-sdk';
import * as AWSMock from 'aws-sdk-mock';
import * as sqsMockRequests from '../__mocks__/aws-sqs-requests';
import * as sqsMockResults from '../__mocks__/aws-sqs-results';
import * as callbackMocker from '../__mocks__/callback-mocker';
import * as managerMocks from '../__mocks__/manager';
import { SqsConfig } from '../models';
import { SqsManager } from '../sqs-manager';
import * as Utils from '../utils';

jest.setTimeout(10000);

const sqsConfig: SqsConfig = {
  apiVersion: '2012-11-05',
  queueName: 'queueName',
  region: 'us-east-1',
};

let sqsManager: SqsManager;

beforeEach(() => {
  sqsManager = new SqsManager(sqsConfig);
  AWSMock.setSDKInstance(AWS);
});

test('Should set the service queueurl', async () => {
  AWSMock.mock('SQS', 'getQueueUrl', callbackMocker.getFunction(sqsMockResults.getQueueUrlResult1));
  const sqsMger = new SqsManager(sqsConfig);
  const queueUrl = await sqsMger.setQueueUrl();
  expect(queueUrl).toEqual('https://mocked.aws.queueurl');
});

test('Should a single message and get a result', async () => {
  AWSMock.mock('SQS', 'sendMessage', callbackMocker.getFunction(sqsMockResults.sendMessageResult1));
  const sendMessageResult = await sqsManager.sendMessage(sqsMockRequests.sendMessageRequest1);
  expect(sendMessageResult).toBe(sqsMockResults.sendMessageResult1);
});

test('Should send message batches and get batch responses', async () => {
  AWSMock.mock('SQS', 'sendMessageBatch', callbackMocker.getFunction(sqsMockResults.sendMessageBatchResult1));
  const messageBatchResult = await sqsManager.sendMessageBatches([
    sqsMockRequests.sendMessageBatchRequestEntry1,
    sqsMockRequests.sendMessageBatchRequestEntry2,
  ]);
  expect(messageBatchResult).toBeTruthy();

  if (Array.isArray(messageBatchResult)) {
    const successMessageIds = Utils.flatArray(
      messageBatchResult.map(result => result.Successful.map(msg => msg.MessageId)),
    );
    expect(successMessageIds).toEqual(['msg-1', 'msg-2']);
  } else {
    expect(messageBatchResult).toEqual(sqsMockResults.sendMessageBatchResult1);
  }
});

test('Should receive specified number of messages from SQS', async () => {
  AWSMock.mock('SQS', 'receiveMessage', callbackMocker.getFunction(sqsMockResults.receiveMessageResult1));
  const messageBatchResult = await sqsManager.receiveMessage(sqsMockRequests.receiveMessageRequest1);
  expect(messageBatchResult && messageBatchResult.Messages).toBeTruthy();
  expect(messageBatchResult.Messages!.length).toEqual(sqsMockRequests.receiveMessageRequest1.MaxNumberOfMessages);
});

test('Should resolve (receive and delete) messages from SQS', async () => {
  AWSMock.mock('SQS', 'deleteMessageBatch', callbackMocker.getFunction(sqsMockResults.deleteMessageBatchResult1));
  const deleteMessageBatchResult = await sqsManager.resolveMessage(sqsMockRequests.receiveMessageRequest1);
  expect(deleteMessageBatchResult).toEqual(managerMocks.resolveMessageResult1);
});

test('Should delete a message batch', async () => {
  AWSMock.mock('SQS', 'deleteMessageBatch', callbackMocker.getFunction(sqsMockResults.deleteMessageBatchResult1));
  const deleteMessageBatchResult = await sqsManager.deleteMessageBatch(
    sqsMockRequests.deleteMessageBatchRequestEntryList1,
  );
  expect(deleteMessageBatchResult).toBe(sqsMockResults.deleteMessageBatchResult1);
});

test('Should delete a single message entry', async () => {
  AWSMock.mock('SQS', 'deleteMessage', callbackMocker.getFunction(managerMocks.deleteMessageResult1));
  const deleteMessageResult = await sqsManager.deleteMessage(managerMocks.deleteMessageRequest1);
  expect(deleteMessageResult).toBe(managerMocks.deleteMessageResult1);
});
