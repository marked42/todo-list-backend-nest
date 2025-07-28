export enum ResponseCode {
  SUCCESS = 0,
}

export interface Response<T> {
  code: ResponseCode;
  data?: T;
  message: string;
}

const RESPONSE_KEY = Symbol('response');

export function isStandardResponse<T>(obj: unknown): obj is Response<T> {
  return !!(obj && obj[RESPONSE_KEY]);
}

export function resp<T>(res: Partial<Response<T>>) {
  const obj = {
    code: ResponseCode.SUCCESS,
    message: 'success',
    ...res,
  };

  Object.defineProperty(obj, RESPONSE_KEY, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });

  return obj;
}
