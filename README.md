# `aws-sqs-manager`

> AWS SQS JS/TS Manager Service.

## Table of Contents

- [`aws-sqs-manager`](#aws-sqs-manager)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Install](#install)
  - [Example](#example)
    - [Configuration](#configuration)
    - [Set Queue Url](#set-queue-url)
    - [Call a service method](#call-a-service-method)
  - [Methods Summary](#methods-summary)

## Description

This service provides asynchonous methods to manage the AWS SQS service. It uses the aws-sdk library and the TS type definitions. It provides TS definitions for the service as well.

The service make us of some AWS interfaces. For full reference checkout the [AWS SQS Javascript documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html).

## Install

```console
npm install -S aws-sqs-manager
```

## Example

### Configuration

Instantiate a new service using a valid *SqsConfig* configuration:

```javascript
const SQS = require('aws-sqs-manager');

const sqsConfig = {
  apiVersion: '2012-11-05',
  queueName: 'queueName',
  region: 'us-east-1'
}
const sqsManager = new SQS.SqsManager(sqsConfig);
```

Typescript:

```typescript
import {SqsConfig, SqsManager} from 'aws-sqs-manager';

const sqsConfig: SqsConfig = {
  apiVersion: '2012-11-05',
  queueName: 'queueName',
  region: 'us-east-1'
}
const sqsManager = new SqsManager(sqsConfig);
```

### Set Queue Url

Every service method call validate the __queue url__ global value and initialize it if needed using the __queueName__ property set in the configuration object, _so you must send an empty QueueUrl parameter on the requests that require it_ and it will be initialized using the previous resolved __queue url__ value. If you need to manage a new queue you must initiate by calling the __setQueueUrl__ method, it sets and return the QueueUrl, so you can use it value if needed on some requests.

AWS recommends NOT to store sqs url values because they can change and request the queue url using the queue name.

```javascript
sqsManager.setQueueUrl('newQueueName');
```

### Call a service method

```javascript
const SQS = require('aws-sqs-manager');

const sendMessageRequest = {
  MessageAttributes: {
    attribute1: {
      DataType: 'String',
      StringValue: 'StringValue1'
    },
    attribute2: {
      DataType: 'Number',
      StringValue: '1'
    }
  },
  MessageBody: 'Message body',
  QueueUrl: ''
};

// declare your sqsConfig
const sqsManager = new SQS.SqsManager(sqsConfig);
try{
    const result = await sqsManager.sendMessage(sendMessageRequest);
    // do something with result
} catch(error) {
    // do something with error
}
```

Typescript:

```typescript
import {SqsConfig, SqsManager} from 'aws-sqs-manager';
import { SendMessageRequest } from 'aws-sdk/clients/sqs';

const sendMessageRequest: SendMessageRequest = {
  MessageAttributes: {
    attribute1: {
      DataType: 'String',
      StringValue: 'StringValue1'
    },
    attribute2: {
      DataType: 'Number',
      StringValue: '1'
    }
  },
  MessageBody: 'Message body',
  QueueUrl: ''
};

// declare your sqsConfig
const sqsManager = new SqsManager(sqsConfig);
try{
    const result = await sqsManager.sendMessage(sendMessageRequest);
    // do something with result
} catch(error) {
    // do something with error
}
```

## Methods Summary

| Method | Description | Request | Result |
|--|--|--|--|
| deleteMessage | Delete a message from the current queue. | The receipt handle of the message returned by receive message method. | Default AWS request response. |
| delateMessageBatch | Send a request to delete a message batch. Batch message size up to 10 entries. | A list of AWS SQS delete message batch request entries. | Single message batch delete result or a collection of batch delete results. |
| receiveMessage | Send a receive request for a single or multiple messages. Batch message szie up to 10 entries. | A valid AWS SQS receive message request. | Sent message(s) result. |
| resolveMessage | Send a request to resolve (retreive and delete) a single or multiple messages. | A valid AWS SQS receive message request. | Result of received and deleted messages. |
| resolveRequiredMessages | Executes a longpolling to resolve required messages in the initialized queue within an specified seconds timeout. | Request to resolve all messages. | Fetched messages, successful and failed messages deletes. |
| sendMessage | Send a single message to be stored on the AWS SQS queue. | A valid AWS SQS send message request. If QueueUrl property is pass as empty string, the method will use the curren service queue url. | Send message result. |
| sendMessageBatches | Send a single batch or multiple batches of messages to the associated queue. | Collection of AWS send message batch request entries. | Message Batch results or Array of message batches results if the entries lenght is greater than the AWS SQS maximum batch size of 10. |
| setQueueUrl | Set the default service queue Url to use on all method calls. | SQS queue name. If empty or null, the config value will be used. | The SQS queue Url. |