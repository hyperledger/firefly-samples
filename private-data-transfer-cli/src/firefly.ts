import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';

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

  async firstMessageOfType(type: string, timeout: number) {
    const expire = Date.now() + timeout;
    while (Date.now() < expire) {
      for (const message of this.messages) {
        if (message.type === type) {
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

  async sendBroadcast(data: FireFlyData[]) {
    await this.rest.post(`/namespaces/${this.ns}/messages/broadcast`, { data });
  }

  retrieveData(data: FireFlyDataIdentifier[]) {
    return Promise.all(data.map(d =>
      this.rest.get<FireFlyData>(`/namespaces/${this.ns}/data/${d.id}`)
      .then(response => response.data)));
  }
}
