const { createServer } = require("vite");

let server;

async function main() {
  server = await createServer({
    server: { host: "127.0.0.1", port: 5173 }
  });
  await server.listen();
}

async function shutdown() {
  if (server) {
    await server.close();
  }
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
