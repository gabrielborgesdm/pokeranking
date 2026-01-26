import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextUser {
  id: string;
  username: string;
  email: string;
}

export interface RequestContextData {
  user?: RequestContextUser;
  requestId?: string;
  path?: string;
  method?: string;
}

@Injectable()
export class RequestContextService {
  private static storage = new AsyncLocalStorage<RequestContextData>();

  static run<T>(context: RequestContextData, callback: () => T): T {
    return RequestContextService.storage.run(context, callback);
  }

  static get(): RequestContextData | undefined {
    return RequestContextService.storage.getStore();
  }

  static getUser(): RequestContextUser | undefined {
    return RequestContextService.get()?.user;
  }

  static setUser(user: RequestContextUser): void {
    const store = RequestContextService.get();
    if (store) {
      store.user = user;
    }
  }
}
