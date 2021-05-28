async function bootstrap() {
  console.log('Hello FireFly');
}

bootstrap().catch(err => {
  console.error(`Failed to run: ${err}`);
});
