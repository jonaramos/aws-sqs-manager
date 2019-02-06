type CallBack = (error: any, data: any) => void;

export function setFunction(response: any) {
  return (params: any, callback: CallBack) => {
    callback(null, response);
  };
}
