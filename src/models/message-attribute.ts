import { AttributeDataType } from './attribute-data-type';

/**
 * dataType: {string, number, binary }
 */
export interface MessageAttribute {
  name: string;
  dataType: AttributeDataType;
  stringValue?: string;
  binaryValue?: Buffer | any[] | string;
}
