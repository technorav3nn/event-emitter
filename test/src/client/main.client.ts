import { EventEmitter } from "@rbxts/event-emitter";

interface MyEvents {
    test: (a: string, b: number) => void;
    offTest: (message: string) => void;
}

const emitter = new EventEmitter<MyEvents>();

emitter.on("test", (a, b) => {
    print(a, b);
});

print('wait 2 seconds...');

task.wait(2);

print('emit test event');

emitter.emit('test', "hello", 4)
emitter.emit('test', "hello 2", 5)

print('testing EventEmitter#off')

const listener = (message: string) => {
    print("offTest event fired with message: " + message);
}

emitter.on("offTest", listener);

emitter.emit('offTest', "hello");

emitter.off("offTest", listener);

// this should not print anything
emitter.emit('offTest', "hello 2");
print('didnt print anything, good!')

emitter.on("offTest", listener);

// this should print
emitter.emit('offTest', "hello 3");


