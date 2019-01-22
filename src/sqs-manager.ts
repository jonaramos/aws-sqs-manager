import * as sqsSdk from 'aws-sdk/clients/sqs';
import { AWSError } from 'aws-sdk/lib/error';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AttributesMap, MessageRequestAttribute, ReceiveDeleteMessageResponse, SendMessageRequest, SqsConfig } from './models';
import * as Utils from './utils';

const sqsBatchMaximum = 10;

/** Message tasks enqueue service class. */
export class SqsManager {
  private queueUrl: string;
  private sqs: sqsSdk;

   /**
    * Create a Sqs Manager
    * @param {SqsConfig} config Sqs configuration
    */
  constructor(private config: SqsConfig) {
    this.queueUrl = '';
    this.sqs = new sqsSdk({ apiVersion: config.apiVersion, region: config.region });
  }

  /**
   * Set the service queue Url.
   * @param queueName SQS queue name. If empty or null, the config value will be used.
   */
  public async setQueueUrl(queueName?: string) {
    if (!queueName) {
      queueName = this.config.queueName
    }

    const queueUrlResponse = await this.sqs.getQueueUrl({ QueueName: queueName }).promise();

    if (queueUrlResponse === undefined || !queueUrlResponse.QueueUrl ) {
      throw new Error('Queue Url resolve failed');
    }

    this.queueUrl = queueUrlResponse.QueueUrl;
  }

  /**
   * Send a collection of messages to the associated 
   * @param {SendMessageRequest[]} messages Messages collection.
   * @returns Sent messages result.
   */
  public async sendMessages(messages: SendMessageRequest[]): Promise<Array<PromiseResult<sqsSdk.SendMessageBatchResult, AWSError>>> {

    if (!messages) {
      throw new TypeError('Invalid Messages Request object');
    }

    if (!this.queueUrl) {
      this.setQueueUrl();
    }

    // split messages in batches
    let entries: sqsSdk.SendMessageBatchRequestEntryList;
    const batches = Utils.splitInPages(messages, sqsBatchMaximum);
    const sendMessageBatches: sqsSdk.SendMessageBatchRequest[] = [];

    for (const batch of batches) {
      entries = batch.map( msg => {

        const sendMessageReq: sqsSdk.SendMessageBatchRequestEntry = {
          Id: msg.id,
          MessageBody: msg.body,
        };

        // generate attributes
        if ( msg.attributes ) {

          const attributes = msg.attributes.reduce( (previous, current) => {
            const msgAttribute: MessageRequestAttribute = {
              DataType: current.dataType
            }
    
            if (current.stringValue) {
              msgAttribute.StringValue = current.stringValue;
            }
    
            if (current.binaryValue) {
              msgAttribute.BinaryValue = current.binaryValue;
            }

            previous[current.name] = msgAttribute;
            return previous;

          }, {} as AttributesMap);

          sendMessageReq.MessageAttributes = attributes;
        }

        return sendMessageReq;
      })

      // save batches
      sendMessageBatches.push({
        Entries: entries,
        QueueUrl: this.queueUrl
      });
    }

    // send messages batches
    const tasks: Array<PromiseResult<sqsSdk.SendMessageBatchResult,AWSError>> = [];
    for ( const msgBatch of sendMessageBatches ) {
      const messageResponse = await this.sqs.sendMessageBatch(msgBatch).promise();
      tasks.push(messageResponse);
    }

    return await Promise.all(tasks);
  }

  /**
   * Send a request for a single or multiple messages.
   * @param receiveMessageRequest A valid AWS SQS message request.
   * @returns Promise of message(s) result.
   */
  public async receiveMessage(receiveMessageRequest: sqsSdk.ReceiveMessageRequest): Promise<PromiseResult<sqsSdk.ReceiveMessageResult,AWSError>> {
    const messagesMaximum = receiveMessageRequest.MaxNumberOfMessages || 1;
    if ( this.invalidBatchLenght(messagesMaximum) ) {
      throw new RangeError(`The maxNumber argument must be between 1 and ${sqsBatchMaximum}`);
    }

    return await this.sqs.receiveMessage(receiveMessageRequest).promise();
  }

  /**
   * Send a request for to resolve (retreive and delete) a single or multiple messages.
   * @param receiveMessageRequest A valid AWS SQS message request.
   * @returns Result of successful and failed resolved messages.
   */
  public async receiveAndDeleteMessage(receiveMessageRequest: sqsSdk.ReceiveMessageRequest): Promise<ReceiveDeleteMessageResponse> {
    const response = await this.receiveMessage(receiveMessageRequest);
    
    if ( !response.Messages ) {
      throw new Error('Sqs messages response is null');
    }

    const entries: sqsSdk.DeleteMessageBatchRequestEntryList = response.Messages.map( msg => {
      if ( !msg.ReceiptHandle ) {
        throw new ReferenceError('SQS message has no ReceiptHandle property.');
      }

      return { 
        Id: msg.MessageId!,
        ReceiptHandle: msg.ReceiptHandle
      };
    } );

    const deleteResponse = await this.deleteMessageBatch(entries);

    return {
      DeleteResult: {
        Failed: deleteResponse.Failed,
        Successful: deleteResponse.Successful
      },
      Messages: response.Messages
    };
  }

  /**
   * Send a request for multiple message deletion.
   * @param entries A collection of delete message request entries.
   * @returns Message batch delete result.
   */
  public async deleteMessageBatch(entries: sqsSdk.DeleteMessageBatchRequestEntry[]): Promise<PromiseResult<sqsSdk.DeleteMessageBatchResult, AWSError>> {
    if ( this.invalidBatchLenght(entries.length) ) {
      throw new RangeError(`The entries argument length must be between 1 and ${sqsBatchMaximum}`);
    }

    const deleteRequest: sqsSdk.DeleteMessageBatchRequest = {
      Entries: entries,
      QueueUrl: this.queueUrl
    };

    return await this.sqs.deleteMessageBatch(deleteRequest).promise();
  }

  /**
   * Delete a message from the current SQS queue.
   * @param receiptHandle Message receipt id returned on message request
   */
  public async deleteMessage(receiptHandle: string) {
    const deleteRequest: sqsSdk.DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle
    }
    return await this.sqs.deleteMessage(deleteRequest).promise();
  }

  private invalidBatchLenght(length: number): boolean {
    return 1 > length && length > sqsBatchMaximum;
  }
}