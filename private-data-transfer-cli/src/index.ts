import { FireFly, FireFlyListener, FireFlyData } from "./firefly";

const TIMEOUT = 15 * 1000;

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
