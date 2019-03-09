# nestd
`nestd` is a simplified framework for building Node.js applications.
Most of the `nestd` source code is directly taken from [Nest.js](https://nestjs.com).

## What's the point?
`nestd` is extremely similar to `Nest.js`.
`Nest.js` is great, but it’s opinionated.
It assumes that the core of your application will be an HTTP server.
As a result, it provides you with a lot of built-ins and utilities for developing websites or APIs.

But sometimes you don’t necessarily want to communicate over HTTP.
Sometimes you don’t necessarily even want to communicate at all.
Still, the abstractions that `Nest.js` provides are extremely useful when building large applications with many component.
**We wanted a framework with two basic components: services and modules**.

`nestd` takes these key components from `Nest.js` to create a new, simplified framework.
Just like with `Nest.js`, you can define services that talk to one another and modules that weave these services together.
However, `nestd` has no native concept of HTTP servers.
If you want to expose your app via an HTTP API, you can implement the server as a service.

## Documentation
We're actively working on putting together some documentation for `nestd`.
Fortunately, because `nestd` is only slightly adapted from `Nest.js`, you can pretty much get away with using the [Nest.js docs](https://docs.nestjs.com/).

## Nest.js Differences
### Services
Unlike `Nest.js`, `nestd` has no concept of Controllers, Providers, and Injectables.
`nestd` only has two components, services and modules.

Services are identified using an `@Service()`.
For example:

```js
// example.service.ts
import { Service } from '@nestd/common'

@Service()
export class ExampleService {
  // Do stuff.
}
```

### Modules
Modules in `nestd` basically function the same way that they they do in `Nest.js`.
They can import and export other modules or services.

```js
// app.module.ts
import { Module } from '@nestd/common'
import { ExampleService } from './example.service'

@Module({
  services: [
    ExampleService
  ]
})
export class AppModule { }
```

### App Bootstrap
We need an entry point that actually initializes and starts the app.
However, unlike `Nest.js`, the app that gets created is just a shell that holds all of the other services.

```js
// main.ts
import { NestdFactory } from '@nestd/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestdFactory.create(AppModule)
  app.start() // It's running!
}
bootstrap()
```
