import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';

export interface TokenPool {
  name: string;
  type: string;
}

export interface FireFlyData {
  value: string;
}

export interface FireFlyDataIdentifier {
  id: string;
  hash: string;
}

export interface FireFlyMessage {
  id: string;
  type: string;
  message: {
    data: FireFlyDataIdentifier[];
    header: {
      tag: string,
      topic: string[]
    }
  }
}

export class FireFlyListener {
  private ws: WebSocket;
  private connected: Promise<void>;
  private messages: FireFlyMessage[] = [];

  constructor(port: number, ns = 'default') {
    this.ws = new WebSocket(`ws://localhost:${port}/ws?namespace=${ns}&ephemeral&autoack`);
    this.connected = new Promise<void>(resolve => {
      this.ws.on('open', resolve);
      this.ws.on('message', (data: string) => {
        this.messages.push(JSON.parse(data));
      });
    });
  }

  ready() {
    return this.connected;
  }

  close() {
    this.ws.close();
  }

  async firstMessageOfType(type: string, timeout: number, tag?: string) {
    const expire = Date.now() + timeout;
    while (Date.now() < expire) {
      for (const message of this.messages) {
        if (message.type === type && (tag ? (message.message?.header.tag == tag): true)) {
          return message;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return undefined;
  }
}

export class FireFly {
  private rest: AxiosInstance;
  private ns = 'default';

  constructor(port: number) {
    this.rest = axios.create({ baseURL: `http://localhost:${port}/api/v1` });
  }

  async getTokenPoolByName(name: string) {
    let response;
    try {
      response = await this.rest.get(`/namespaces/${this.ns}/tokens/pools/${name}`);
    } catch {
      return null;
    }
    return response.data;
  }

  async createPool(data: TokenPool) {
    await this.rest.post(`/namespaces/${this.ns}/tokens/pools`, data);
  }

  async mintToken(num: string, toAddress: string, pool: string, tag?: string) {
    await this.rest.post(`/namespaces/${this.ns}/tokens/mint`, { 
      amount : num, 
      pool,
      to: toAddress,
      message: {
        header: { tag },
        data: [{
          value: "minting"
        }]
      }
    })
  }

  
  async getAccounts() {
    const response = await this.rest.get(`/network/organizations`);
    return response.data;
  }

  async checkBalance() {
    console.log(`/namespaces/${this.ns}/tokens/balances`);
    const response = await this.rest.get(`/namespaces/${this.ns}/tokens/balances`);
    return response.data;
  }

  async transferToken(tokenIndex: string, pool: string, toAddress: string, tag: string) {
    await this.rest.post(`/namespaces/${this.ns}/tokens/transfers`, { 
      pool: pool,
      tokenIndex: tokenIndex,
      amount: 1,
      to: toAddress,
      message: {
        header: { tag },
        data: [{
          value: "transferring"
        }]
      }
    });
  }

  retrieveData(data: FireFlyDataIdentifier[]) {
    return Promise.all(data.map(d =>
      this.rest.get<FireFlyData>(`/namespaces/${this.ns}/data/${d.id}`)
      .then(response => response.data)));
  }
}
