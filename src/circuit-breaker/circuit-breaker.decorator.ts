/**
 * Decorator that applies circuit breaker pattern to the decorated method.
 *
 * @param options - Options for configuring the circuit breaker behavior.
 * @param options.maxFailures - Number of consecutive failures after which the circuit will be opened. Default is 1.
 * @param options.requestThreshold - How many requests should be ignore before turning the circuite to half-open. Default is 3.
 * @returns A decorator function.
*/
export function CircuitBreaker(options?: { maxFailure?: number, requestsThreshold?: number }) {
    const { maxFailure, requestsThreshold } = { requestsThreshold: options?.requestsThreshold ?? 3, maxFailure: options?.maxFailure ?? 1 };
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const isAsync = originalMethod.constructor.name === "AsyncFunction";
        if (isAsync) {
            let status: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
            let failCount = 0;
            let requestsCount = 0;
            descriptor.value = async function(...args: any[]) {
                requestsCount += status === "OPEN" ? 1 : 0;
                if (requestsCount >= requestsThreshold) {
                    status = "HALF_OPEN";
                    requestsCount = 0;
                }

                if (status === "CLOSED" || status === "HALF_OPEN") {
                    try {
                        const result = await originalMethod.apply(this, args);
                        if (status === "HALF_OPEN") {
                            status = "CLOSED";
                        }
                        failCount = 0;
                        return result;
                    } catch (error) {
                        failCount += status === "CLOSED" ? 1 : 0;
                        if (failCount >= maxFailure || status === "HALF_OPEN") {
                            status = "OPEN";
                        }
                        throw error;
                    }
                } else {
                    throw new Error(`${originalMethod.name}::CircuitBreaker - OPEN`);
                }
            };
        }
        return descriptor;
    };
}
