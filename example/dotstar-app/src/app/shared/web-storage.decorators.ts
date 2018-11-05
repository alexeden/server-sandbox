class WebStorageUtility {
  static get(storage: Storage, key: string): any {
    const value = storage.getItem(key);
    try {
      // tslint:disable-next-line:no-non-null-assertion
      return JSON.parse(value!);
    }
    catch (e) {
      return value;
    }
  }

  static set(storage: Storage, key: string, value: any) {
    const settableValue = typeof value === 'string' ? value : JSON.stringify(value);
    storage.setItem(key, settableValue);
  }

  static remove(storage: Storage, key: string) {
    storage.removeItem(key);
  }
}


const WebStorage = (storage: Storage, overrideKey?: string): PropertyDecorator => {
  return (target: {}, propertyName: string): void => {
    const key = overrideKey || propertyName;

    Object.defineProperty(target, propertyName, {
      get() {
        return WebStorageUtility.get(storage, key);
      },
      set(value: any) {
        if (typeof value === 'undefined' || value === null) {
          WebStorageUtility.remove(storage, key);
        }
        else {
          WebStorageUtility.set(storage, key, value);
        }
      },
    });
  };
};

export const LocalStorage = (key?: string): PropertyDecorator => WebStorage(localStorage, key);
export const SessionStorage = (key?: string): PropertyDecorator => WebStorage(sessionStorage, key);
