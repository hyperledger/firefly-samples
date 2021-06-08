import axios, { AxiosInstance } from 'axios';
import WebSocket from 'ws';

const TIMEOUT = 15 * 1000;

interface FireFlyData {
  value: string;
}

interface FireFlyDataIdentifier {
  id: string;
  hash: string;
}

interface FireFlyMessage {
  id: string;
  type: string;
  message: {
    data: FireFlyDataIdentifier[];
  }
}

class FireFlyListener {
  private ws: WebSocket;
  private connected: Promise<void>;
  private messages: FireFlyMessage[] = [];

  constructor(port: number, namespace='default') {
    this.ws = new WebSocket(`ws://localhost:${port}/ws?namespace=${namespace}&ephemeral&autoack`);
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

  firstMessageOfType(type: string, timeout: number) {
    return new Promise<FireFlyMessage | undefined>(async (resolve) => {
      const expire = Date.now() + timeout;
      while (Date.now() < expire) {
        for (const message of this.messages) {
          if (message.type === type) {
            resolve(message);
            return;
          }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return undefined;
    });
  }
}

class FireFly {
  private rest: AxiosInstance;

  constructor(port: number) {
    this.rest = axios.create({ baseURL: `http://localhost:${port}/api/v1` });
  }

  async sendBroadcast(data: FireFlyData[]) {
    await this.rest.post('/namespaces/default/broadcast/message', { data });
  }

  async getData(id: string) {
    const response = await this.rest.get<FireFlyData>(`/namespaces/default/data/${id}`)
    return response.data;
  }
}

async function main() {
  const firefly1 = new FireFly(5000);
  const firefly2 = new FireFly(5001);
  const ws1 = new FireFlyListener(5000);
  const ws2 = new FireFlyListener(5001);
  await ws1.ready();
  await ws2.ready();

  const sendData: FireFlyData = { value: 'Hello' };
  console.log(`Broadcasting data value from firefly1: ${sendData.value}`);
  await firefly1.sendBroadcast([sendData]);

  const receivedMessage = await ws2.firstMessageOfType('message_confirmed', TIMEOUT);
  if (receivedMessage === undefined) {
    throw new Error('No message received');
  }

  for (const dataID of receivedMessage.message.data) {
    const receivedData = await firefly2.getData(dataID.id);
    console.log(`Received data value on firefly2: ${receivedData.value}`);
  }

  ws1.close();
  ws2.close();
}

main().catch(err => {
  console.error(`Failed to run: ${err}`);
});
