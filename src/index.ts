/* eslint-disable @typescript-eslint/no-explicit-any */
import Signal from "@rbxts/signal";

/**
 * Represents a class with a signal and its listeners.
 * @class
 */
export class SignalManager {
	/**
	 * The signal.
	 */
	public readonly signal: Signal<(...args: unknown[]) => void>;

	/**
	 * The listeners.
	 * @private
	 * @readonly
	 * @type {Map<Function, RBXScriptConnection>}
	 */
	public readonly listeners: Map<Callback, RBXScriptConnection>;

	/**
	 * Creates a new SignalManager.
	 * @constructor
	 * @param {Signal} signal The signal.
	 * @param {Map<Function, RBXScriptConnection>} listeners The listeners.
	 */
	public constructor() {
		this.signal = new Signal();
		this.listeners = new Map();
	}

	/**
	 * Connects a listener to the signal.
	 * @param {Function} listener The listener.
	 * @returns {RBXScriptConnection} The connection.
	 * @public
	 */
	public connect(listener: Callback): RBXScriptConnection {
		const connection = this.signal.Connect(listener);
		this.listeners.set(listener, connection);
		return connection;
	}

	/**
	 * Disconnects a listener from the signal.
	 * @param {Function} listener The listener.
	 * @public
	 * @returns {void}
	 * @throws {Error} If the listener is not connected.
	 */
	public disconnect(listener: Callback): void {
		const connection = this.listeners.get(listener);
		if (connection && connection.Connected) {
			connection.Disconnect();
			this.listeners.delete(listener);
		} else {
			throw `Listener is not connected or couldn't find listener`;
		}
	}
}

export type ListenerSignature<L> = {
	[E in keyof L]: (...args: any[]) => any;
};

export type DefaultListener = {
	[k: string]: (...args: any[]) => any;
};

/**
 * A dead simple event emitter implementation for Roblox TS.
 * @class
 */
export class EventEmitter<Events extends ListenerSignature<Events> = DefaultListener> {
	/**
	 * The listeners.
	 * @private
	 * @readonly
	 * @type {Map<keyof L, SignalManager>}
	 */
	private readonly events: Map<keyof Events, SignalManager>;

	/**
	 * The default maximum number of listeners.
	 * @public
	 * @static
	 */
	public static defaultMaxListeners = 25;

	/**
	 * Creates a new EventEmitter.
	 * @constructor
	 */
	public constructor() {
		this.events = new Map();
	}

	/**
	 * Adds a listener to the specified event.
	 * @param {keyof L} event The event.
	 * @param {L[E]} listener The listener.
	 * @returns {RBXScriptConnection} The connection.
	 */
	public on<EventName extends keyof Events>(event: EventName, listener: Events[EventName]): RBXScriptConnection {
		if (!this.events.has(event)) {
			this.events.set(event, new SignalManager());
		}
		return this.events.get(event)!.connect(listener as Callback);
	}

	/**
	 * Adds a listener to the specified event.
	 * @param {keyof L} event The event.
	 * @param {L[E]} listener The listener.
	 * @returns {RBXScriptConnection} The connection.
	 */
	public addListener = (...args: Parameters<typeof this.on>) => this.on(...args);

	/**
	 * Listen to an event, but once its fired it will be destroyed
	 * @param {keyof L} event The event.
	 * @param {L[E]} listener The listener.
	 */
	public once<EventName extends keyof Events>(event: EventName, listener: Events[EventName]): RBXScriptConnection {
		if (!this.events.has(event)) {
			this.events.set(event, new SignalManager());
		}

		return this.events.get(event)!.connect((...args: unknown[]) => {
			listener(...(args as unknown[]));
			this.off(event, listener);
		});
	}

	/**
	 * Removes a listener from the specified event.
	 * @param {keyof L} event The event.
	 * @param {L[E]} listener The listener.
	 * @returns {void}
	 */
	public off<EventName extends keyof Events>(eventName: EventName, listener: Events[EventName]) {
		if (this.events.has(eventName)) {
			this.events.get(eventName)!.disconnect(listener as Callback);
		}
	}

	/**
	 * Removes a listener from the specified event.
	 * @param {keyof L} event The event.
	 * @param {L[E]} listener The listener.
	 * @returns {void}
	 */
	public removeListener = (...args: Parameters<typeof this.off>) => this.off(...args);

	/**
	 * Emits an event.
	 * @param {keyof L} event The event.
	 * @param {Parameters<L[E]>} args The arguments.
	 * @returns {void}
	 */
	public emit<EventName extends keyof Events>(event: EventName, ...args: Parameters<Events[EventName]>): void {
		if (this.events.has(event)) {
			this.events.get(event)!.signal.Fire(...(args as unknown[]));
		}
	}

	/**
	 * Gets all the event names.
	 * @returns {Array<keyof L>} The event names.
	 * @public
	 */
	public eventNames(): Array<keyof Events> {
		const keys = (() => {
			const output: Array<keyof Events> = [];
			this.events.forEach((_, key) => {
				output.push(key);
			});
			return output;
		})();

		return keys;
	}

	/**
	 * Gets the number of listeners for the specified event.
	 * @param {keyof L} event The event.
	 * @returns {number} The number of listeners.
	 * @public
	 */
	public listenerCount<EventName extends keyof Events>(event: EventName): number {
		return this.eventNames()
			.filter((eventName) => eventName === event)
			.size();
	}

	/**
	 * Returns an array of functions that are listening to the specified event.
	 * @param {keyof L} event The event.
	 * @returns {Array<L[E]>} The listeners.
	 * @public
	 */
	public listeners<EventName extends keyof Events>(event: EventName): Events[EventName][] {
		if (this.events.has(event)) {
			const { listeners: signalListeners } = this.events.get(event)!;
			const output: Array<Events[EventName]> = [];

			signalListeners.forEach((_: unknown, listener: Callback) => {
				output.push(listener as Events[EventName]);
			});

			return output;
		}
		return [];
	}
}
