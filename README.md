# Circuit Breaker - TypeScript NestJs Decorator
This is a simple example for the circuit breaker pattern made into a decorator.

This is impleamented in NestJs, but could be easily copy-pasted to a TypeScript project.

## Run & Test
1. download the repo and `npm i` the dependecies. (note: this has been built using node v20)
2. in one terminal window run `npm run start:dev`
3. in another terminal window run `curl localhost:3000`
    - you will get a json data with two keys, or an empty json data or a error.
    - the circuit breaker is configured with:
        * `maxFailure`: 2
        * `requestsThreshold`: 3

enjoy.

---

## CircuitBreaker Decorator

Decorator that applies the circuit breaker pattern to the decorated method.

### Parameters

- `options` (optional): Options for configuring the circuit breaker behavior.
  - `options.maxFailure` (optional): Number of consecutive failures after which
  the circuit will be opened. Default is 1.
  - `options.requestsThreshold` (optional): How many requests should be ignored
  before turning the circuit to half-open. Default is 3.

### Return Value

A decorator function.

---

The `CircuitBreaker` decorator applies the circuit breaker pattern to a
decorated method. This pattern helps to prevent cascading failures and provides
fault tolerance in distributed systems. The decorator wraps the original method
with circuit breaker behavior, allowing control over the method's execution
based on the current state of the circuit.

The decorator accepts an optional `options` object that allows configuration of
the circuit breaker behavior. The `maxFailure` option determines the number of
consecutive failures after which the circuit will be opened. By default, the
circuit breaker opens after a single failure. The `requestsThreshold` option
sets the number of requests to be ignored before turning the circuit to half-open.
The circuit will transition to the half-open state when this threshold is reached.
By default, three requests are ignored before entering the half-open state.

When the decorated method is invoked, the decorator checks if it is an
asynchronous function. If so, it maintains internal state variables such as
`status`, `failCount`, and `requestsCount` to manage the circuit breaker behavior.

**The decorator only works on async function**

- If the circuit is in the "OPEN" state the method is called, an error is thrown,
indicating that the circuit is open and requests are not allowed.
- If the circuit is in the "CLOSED" or "HALF_OPEN" state, the original method is executed.
    - If the method execution succeeds, and the circuit is in the "HALF_OPEN" state,
    the circuit is closed again, and the `failCount` is reset.
    - If the method execution fails, the `failCount` is incremented if the circuit
    is in the "CLOSED" state. If the `failCount` exceeds the `maxFailure` threshold
    or the circuit is in the "HALF_OPEN" state, the circuit is opened.
- In the "OPEN" state, the `requestsCount` is incremented for each request.
When the `requestsCount` reaches the `requestsThreshold`, the circuit
transitions to "HALF_OPEN" state, allowing one requests to try again the circuit.

By applying this decorator to a method, you can implement circuit breaker
functionality and control the behavior of the method based on the circuit's state.

![diagram](./assets/diagram.svg)
