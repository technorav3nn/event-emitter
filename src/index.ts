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
	private readonly listeners: Map<Callback, RBXScriptConnection>;

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
	private readonly listeners: Map<keyof Events, SignalManager>;

	/**
	 * Creates a new EventEmitter.
	 * @constructor
	 */
	public constructor() {
		this.listeners = new Map();
	}

	/**
	 * Adds a listener to the specified event.
	 * @param {keyof L} event The event.
	 * @param {L[E]} listener The listener.
	 * @returns {RBXScriptConnection} The connection.
	 */
	public on<EventName extends keyof Events>(event: EventName, listener: Events[EventName]): RBXScriptConnection {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new SignalManager());
		}
		return this.listeners.get(event)!.connect(listener as Callback);
	}

	/**
	 * Removes a listener from the specified event.
	 * @param {keyof L} event The event.
	 * @param {L[E]} listener The listener.
	 * @returns {void}
	 */
	public off<EventName extends keyof Events>(eventName: EventName, listener: Events[EventName]) {
		if (this.listeners.has(eventName)) {
			this.listeners.get(eventName)!.disconnect(listener as Callback);
		}
	}

	/**
	 * Emits an event.
	 * @param {keyof L} event The event.
	 * @param {Parameters<L[E]>} args The arguments.
	 * @returns {void}
	 */
	public emit<EventName extends keyof Events>(event: EventName, ...args: Parameters<Events[EventName]>): void {
		if (this.listeners.has(event)) {
			this.listeners.get(event)!.signal.Fire(...(args as unknown[]));
		}
	}
}
