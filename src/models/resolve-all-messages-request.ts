import { AttributeNameList, MessageAttributeNameList } from 'aws-sdk/clients/sqs';
/** Represents a ResolveAllMessages method's request */
export interface ResolveAllMessagesRequest {
  /** List of service related attributes that need to be returned along each message */
  attributesNames: AttributeNameList;
  /** Maximum timeout in seconds that the SQS queue will be fetched for messages */
  pollingTimeout: number;
  /** List of message's attributes that need to be returned */
  messagesAttributesNames: MessageAttributeNameList;
  /** Total count of messages to retrieve from the queue */
  messagesTotal: number;
  /** The duration (in seconds) that the received messages are hidden from subsequent retrieve requests */
  visibilityTimeout: number;
  /** The duration (in seconds) for wich the each call waits for a each message to arrive in the queue */
  waitTimeSeconds: number;
}