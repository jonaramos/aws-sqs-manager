import { MessageAttribute } from './message-attribute';

export interface SendMessageRequest {
  attributes?: MessageAttribute[];
  body: string;
  id: string;
}