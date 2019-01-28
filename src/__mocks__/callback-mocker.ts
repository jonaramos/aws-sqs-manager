
type CallBack = (error: any, data: any) => void;

export function getFunction(response: any) {
  return (params: any, callback: CallBack) => {
    callback(null, response);
  }
}