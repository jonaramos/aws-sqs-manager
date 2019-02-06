import * as AWS from 'aws-sdk';
import {
  BatchResultErrorEntryList,
  DeleteMessageBatchResultEntryList,
  MessageList,
  ReceiveMessageRequest,
  SendMessageBatchRequest,
  SendMessageBatchRequestEntryList
  } from 'aws-sdk/clients/sqs';
import { AWSError } from 'aws-sdk/lib/error';
import { PromiseResult } from 'aws-sdk/lib/request';
import { DeleteMessageResult, SqsConfig } from './models';
import { ResolveAllMessagesRequest } from './models/resolve-all-messages-request';
import { ResolveAllMessagesResult } from './models/resolve-all-messages-result';
import { ResolveMessageResult } from './models/resolve-message-result';
import * as Utils from './utils';

const sqsBatchMaximum = 10;

/** Message tasks enqueue service class. */
export class SqsManager {
  /**
   * AWS SQS service instance.
   */
  private sqs: AWS.SQS;
  /**
   * Current AWS SQS service queue url.
   */
  private queueUrl: string;

  /**
   * Create a Sqs Manager.
   * @param {SqsConfig} config Sqs configuration.
   */
  constructor(private config: SqsConfig) {
    this.queueUrl = '';
    this.sqs = new AWS.SQS({ apiVersion: config.apiVersion, region: config.region });
  }

  /**
   * Delete a message from the current SQS queue.
   * @param receiptHandle Message receipt id returned on message request.
   * @returns Promise of deleteMessage aws result.
   */
  public async deleteMessage(receiptHandle: string) {
    if (!receiptHandle) {
      throw new TypeError('Empty receipt handle string are not allowed');
    }
    if (!this.queueUrl) {
      await this.setQueueUrl();
    }
    const deleteRequest: AWS.SQS.DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    };
   
    return await this.sqs.deleteMessage(deleteRequest).promise();
  }

  /**
   * Send a request for multiple message deletion.
   * @param entries A collection of delete message request entries.
   * @returns Single message batch delete result or a collection of batch delete results.
   */
  public async deleteMessageBatch(
    entries: AWS.SQS.DeleteMessageBatchRequestEntry[],
  ): Promise<PromiseResult<AWS.SQS.DeleteMessageBatchResult, AWSError>> {
    if (this.invalidBatchLenght(entries.length)) {
      throw new RangeError(`The entries argument length must be between 1 and ${sqsBatchMaximum}`);
    }
    if (!this.queueUrl) {
      await this.setQueueUrl();
    }

    const deleteRequest: AWS.SQS.DeleteMessageBatchRequest = {
      Entries: entries,
      QueueUrl: this.queueUrl,
    };

    return await this.sqs.deleteMessageBatch(deleteRequest).promise();
  }

  /**
   * Set the service queue Url to use on all method calls.
   * @param queueName SQS queue name. If empty or null, the config value will be used.
   * @returns The SQS queue Url.
   */
  public async setQueueUrl(queueName?: string): Promise<string> {
    if (!queueName) {
      queueName = this.config.queueName;
    }
    const queueUrlResponse = await this.sqs.getQueueUrl({ QueueName: queueName }).promise();

    if (queueUrlResponse === undefined || !queueUrlResponse.QueueUrl) {
      throw new Error('Queue Url resolve failed');
    }

    this.queueUrl = queueUrlResponse.QueueUrl;
    return this.queueUrl;
  }

  /**
   * Send a receive request for a single or multiple messages (Up to 10).
   * @param receiveMessageRequest A valid AWS SQS message request.
   * @returns Sent message(s) result.
   */
  public async receiveMessage(
    receiveMessageRequest: AWS.SQS.ReceiveMessageRequest,
  ): Promise<PromiseResult<AWS.SQS.ReceiveMessageResult, AWSError>> {
    if (!this.queueUrl) {
      await this.setQueueUrl();
    }
    receiveMessageRequest.QueueUrl = this.queueUrl;

    const messagesMaximum = receiveMessageRequest.MaxNumberOfMessages || 1;
    if (this.invalidBatchLenght(messagesMaximum)) {
      throw new RangeError(`The maxNumber argument must be between 1 and ${sqsBatchMaximum}`);
    }

    return await this.sqs.receiveMessage(receiveMessageRequest).promise();
  }

  /**
   * Send a request to resolve (retreive and delete) a single or multiple messages (Up to 10).
   * @param receiveMessageRequest A valid AWS SQS message request.
   * @returns Result of successful and failed resolved messages.
   */
  public async resolveMessage(receiveMessageRequest: AWS.SQS.ReceiveMessageRequest): Promise<ResolveMessageResult> {
    if (!this.queueUrl) {
      await this.setQueueUrl();
    }
    receiveMessageRequest.QueueUrl = this.queueUrl;

    const receiveResult = await this.receiveMessage(receiveMessageRequest);

    if (!receiveResult.Messages) {
      throw new Error('Sqs messages receiveResult is null');
    }

    const entries: AWS.SQS.DeleteMessageBatchRequestEntryList = receiveResult.Messages.map(msg => {
      if (!msg.ReceiptHandle) {
        throw new ReferenceError('SQS message has no ReceiptHandle property.');
      }

      return {
        Id: msg.MessageId!,
        ReceiptHandle: msg.ReceiptHandle,
      };
    });

    const deleteResult = await this.deleteMessageBatch(entries);

    return {
      deleteMessageResult: deleteResult,
      receiveMessageResult: receiveResult,
    };
  }

  /**
   * Executes a longpolling to resolve required messages in the initialized queue within an specified seconds timeout.
   * @param resolveAllMessagesRequest Contains values to resolve all messages.
   * @returns Fetched messages, successful and failed messages deletes.
   */
  public async resolveRequiredMessages(resolveAllMessagesRequest: ResolveAllMessagesRequest): Promise<ResolveAllMessagesResult> {
    const failedDeletes: BatchResultErrorEntryList = [];
    const messages: MessageList = [];
    const successfulDeletes: DeleteMessageBatchResultEntryList = [];

    const receiveMessageRequest: ReceiveMessageRequest = {
      AttributeNames: resolveAllMessagesRequest.attributesNames,
      MaxNumberOfMessages: sqsBatchMaximum,
      MessageAttributeNames: resolveAllMessagesRequest.messagesAttributesNames,
      QueueUrl: '',
      VisibilityTimeout: resolveAllMessagesRequest.visibilityTimeout,
      WaitTimeSeconds: resolveAllMessagesRequest.waitTimeSeconds,
    }

    const timeout = 1000*resolveAllMessagesRequest.pollingTimeout;

    const timerObj = setTimeout( async () => {
      return {
        failedDeletes,
        messages,
        successfulDeletes
      } as ResolveAllMessagesResult
    }, timeout);

    while( successfulDeletes.length < resolveAllMessagesRequest.messagesTotal ) {
      const resolveResults = await this.resolveMessage(receiveMessageRequest);
      
      if ( resolveResults ) {
        const receivedMessages = resolveResults.receiveMessageResult.Messages;
        if ( receivedMessages && receivedMessages.length > 0 ) {
          receivedMessages.forEach( msg => messages.push(msg) );
        }

        const deletedMessages = resolveResults.deleteMessageResult;
        if ( deletedMessages ) {
          if ( deletedMessages.Successful && deletedMessages.Successful.length > 0 ) {
            deletedMessages.Successful.forEach( deleted => successfulDeletes.push(deleted) );
          }
          if ( deletedMessages.Failed.length > 0 ) {
            deletedMessages.Failed.forEach( failed => failedDeletes.push(failed) );
          }
        }
      }
    }

    clearTimeout(timerObj);
    return {
      failedDeletes,
      messages,
      successfulDeletes
    } as ResolveAllMessagesResult
  }

  /**
   * Send a single message to be stored on the AWS SQS queue.
   * @param sendMessageRequest A valid AWS SQS send message request. If QueueUrl property is pass as empty string, the method will use the curren service queue url.
   * @returns Send message result.
   */
  public async sendMessage(sendMessageRequest: AWS.SQS.SendMessageRequest) {
    if (!this.queueUrl) {
      await this.setQueueUrl();
    }
    sendMessageRequest.QueueUrl = this.queueUrl;

    return await this.sqs.sendMessage(sendMessageRequest).promise();
  }

  /**
   * Send a single batch or multiple batches of messages to the associated queue.
   * @param entries Collection of AWS send message batch request entries.
   * @returns Message Batch results or Array of message batches results if the entries lenght is greater than the AWS SQS maximum batch size of 10.
   */
  public async sendMessageBatches(
    entries: SendMessageBatchRequestEntryList,
  ): Promise<
    | PromiseResult<AWS.SQS.SendMessageBatchResult, AWSError>
    | Array<PromiseResult<AWS.SQS.SendMessageBatchResult, AWSError>>
  > {
    if (!entries) {
      throw new TypeError('Entries empty argument is NOT allowed.');
    }

    if (!this.queueUrl) {
      await this.setQueueUrl();
    }

    // validate entries size to define return type
    if (this.invalidBatchLenght(entries.length)) {
      const sendMessageBatchRequest: SendMessageBatchRequest = {
        Entries: entries,
        QueueUrl: this.queueUrl,
      };
      const test = await this.sqs.sendMessageBatch(sendMessageBatchRequest).promise();
      return test;
    }

    // split messages in batches
    const batches = Utils.splitInPages(entries, sqsBatchMaximum);
    const sendMessageBatchesRequests: SendMessageBatchRequest[] = batches.map(entry => {
      return {
        Entries: entry,
        QueueUrl: this.queueUrl,
      };
    });

    // send messages batches
    const tasks = [];
    for (const msgBatchReq of sendMessageBatchesRequests) {
      const messageResponse = await this.sqs.sendMessageBatch(msgBatchReq).promise();
      tasks.push(messageResponse);
    }

    return await Promise.all(tasks);
  }

  /**
   * Validate if the lenght provided as argument is in the AWS allowed batch range.
   * @param length Lenght number to validate.
   * @returns True if lenght is inside the allowed range. False otherwise.
   */
  private invalidBatchLenght(length: number): boolean {
    return length < 1 || sqsBatchMaximum < length;
  }
}
