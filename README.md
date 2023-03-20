# @rbxts/event-emitter

"node:events" implementation in roblox-ts

## Get started

Install:
```sh
npm i @rbxts/event-emitter
yarn add @rbxts/event-emitter
pnpm i @rbxts/event-emitter
```

Usage:
```ts
import { EventEmitter } from "@rbxts/event-emitter"

interface MyEvents {
  foo: () => void;
  bar: (a: string) => void;
}

const emitter = new EventEmitter<MyEvents>()

emitter.on("foo", () => print("foo!"))
emitter.emit("foo")

const f = (a: string) => print(`A is: ${a}`)

emitter.on("bar", f)

task.wait(1)

emitter.emit("bar", "Testing bar")

// disable the event listener for that specific listener
emitter.off("bar", f)

task.wait(1)

// wont print anything!
emitter.emit("bar", 1)
