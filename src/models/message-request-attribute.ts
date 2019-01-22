import { AttributeDataType } from './attribute-data-type';

export interface MessageRequestAttribute {
  DataType: AttributeDataType;
  StringValue?: string;
  BinaryValue?: Buffer | any[] | string;
}