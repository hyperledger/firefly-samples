import { FireFly, FireFlyListener, FireFlyData } from "./firefly";

const TIMEOUT = 15 * 1000;

const dataValues = (data: FireFlyData[]) => data.map(d => d.value);

async function main() {
  const firefly1 = new FireFly(5000);
  const firefly2 = new FireFly(5001);
  const ws1 = new FireFlyListener(5000);
  const ws2 = new FireFlyListener(5001);
  await ws1.ready();
  await ws2.ready();

  const sendData: FireFlyData[] = [
    { value: 'Hello' },
    { value: 'World' },
  ];

  // Note: this is currently performing broadcast (not private transfer)
  // TODO: use private transfer
  console.log(`Broadcasting data values from firefly1: ${dataValues(sendData)}`);
  await firefly1.sendBroadcast(sendData);

  const receivedMessage = await ws2.firstMessageOfType('message_confirmed', TIMEOUT);
  if (receivedMessage === undefined) {
    throw new Error('No message received');
  }

  const receivedData = await firefly2.retrieveData(receivedMessage.message.data);
  console.log(`Received data value on firefly2: ${dataValues(receivedData)}`);

  ws1.close();
  ws2.close();
}

main().catch(err => {
  console.error(`Failed to run: ${err}`);
});
