export enum ResponseCode {
  SUCCESS = 0,
}

export interface Response<T> {
  code: ResponseCode;
  data: T;
  message: string;
}

const RESPONSE_KEY = Symbol('response');

export function isStandardResponse(obj: any): obj is Response<any> {
  return !!(obj && obj[RESPONSE_KEY]);
}

export function resp<T>(res: Partial<Response<T>>) {
  const obj = { ...res };
  Object.defineProperty(obj, RESPONSE_KEY, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return obj;
}
