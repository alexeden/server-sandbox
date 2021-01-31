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


function WebStorage(storage: Storage, overrideKey?: string): PropertyDecorator {
  return (target: {}, propertyName: string | symbol): void => {
    const key = overrideKey || propertyName;

    Object.defineProperty(target, propertyName, {
      get() {
        return WebStorageUtility.get(storage, `${String(key)}`);
      },
      set(value: any) {
        if (typeof value === 'undefined' || value === null) {
          WebStorageUtility.remove(storage, `${String(key)}`);
        }
        else {
          WebStorageUtility.set(storage, `${String(key)}`, value);
        }
      },
    });
  };
}

export function LocalStorage(key?: string): PropertyDecorator {
  return WebStorage(localStorage, key);
}
export function SessionStorage(key?: string): PropertyDecorator {
  return WebStorage(sessionStorage, key);
}
