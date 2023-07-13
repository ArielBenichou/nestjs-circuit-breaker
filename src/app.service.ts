import { Injectable } from '@nestjs/common';
import { CircuitBreaker } from './circuit-breaker/circuit-breaker.decorator';

@Injectable()
export class AppService {
    async getHello() {
        return await this.unstableApiRequest();
    }

    @CircuitBreaker({ maxFailure: 2 })
    async unstableApiRequest() {
        return new Promise(async (resolve, reject) => {
            await delay(Math.random() * 2000 + 1000);
            // Simulating random behavior
            const randomNumber = Math.random();

            // Randomly fail the request
            if (randomNumber < 0.3) {
                reject(new Error('API request failed.'));
                return;
            }

            // Randomly return empty data
            if (randomNumber < 0.6) {
                resolve({});
                return;
            }

            // Simulated JSON data
            const jsonData = {
                key1: 'value1',
                key2: 'value2',
                // Add more data properties as needed
            };

            resolve(jsonData);
        });
    }
}

function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}
