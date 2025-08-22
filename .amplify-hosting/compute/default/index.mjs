import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { Server } from 'node:http';
import { t as toNodeListener, u as useNitroApp } from './chunks/_/nitro.mjs';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
server.listen(3e3, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Listening on http://localhost:3000 (AWS Amplify Hosting)`);
  }
});
//# sourceMappingURL=index.mjs.map
