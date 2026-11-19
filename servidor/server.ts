import { app } from './src/app';
import { env } from './src/config/env';

app.listen(env.PORT, env.HOST, () => {
  console.info(`API listening on http://${env.HOST}:${env.PORT}`);
});
