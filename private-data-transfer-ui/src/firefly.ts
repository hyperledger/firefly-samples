import axios, { AxiosInstance } from 'axios';

export interface FireFlyDataSend {
  value: string;
}

export interface FireFlyData extends FireFlyDataSend {
  id: string;
}

export interface FireFlyDataIdentifier {
  id: string;
  hash: string;
}

export interface FireFlyMessage {
  id: string;
  type: string;
  header: {
    author: string;
  }
  local: boolean;
  data: FireFlyDataIdentifier[];
}

export class FireFly {
  private rest: AxiosInstance;
  private ns = 'default';

  constructor(port: number) {
    this.rest = axios.create({ baseURL: `http://localhost:${port}/api/v1` });
  }

  async sendBroadcast(data: FireFlyDataSend[]) {
    await this.rest.post(`/namespaces/${this.ns}/broadcast/message`, { data });
  }

  async getMessages() {
    const response = await this.rest.get<FireFlyMessage[]>(`/namespaces/${this.ns}/messages`);
    return response.data;
  }

  retrieveData(data: FireFlyDataIdentifier[]) {
    return Promise.all(data.map(d =>
      this.rest.get<FireFlyData>(`/namespaces/${this.ns}/data/${d.id}`)
      .then(response => response.data)));
  }
}
