import { resolve } from 'path';

import * as Koa from 'koa';

const app = new Koa();

app.use(async ctx => {
    ctx.body = 'Hello World!';
});

app.listen(8100);

console.log(resolve('src'));
