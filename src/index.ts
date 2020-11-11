import axios from 'axios';
import {config} from "dotenv";

config(); // Init dotenv

const {API_KEY = '', MPAN, SERIAL} = process.env;
const FROM = '00:00:00'
const TO = '11:59:59'

const conn = axios.create({
    baseURL: 'https://api.octopus.energy/',
    timeout: 1000,
    auth: {
        username: API_KEY,
        password: ''
    }
});

const calculate_avg = (count: number, results: []) => {
    const total = results.reduce(
        (total: number, value: {consumption: number}) => total += value.consumption, 0
    );
    return (total / count);
}

// TODO: Tests
// TODO: Push notifications

(async () => {
    const [date,] = new Date(Date.now()).toISOString().split('T');
    try {
        const resp = await conn(`/v1/electricity-meter-points/${MPAN}/meters/${SERIAL}/consumption`, {
            params: {
                period_from: `${date}T${FROM}`,
                period_to: `${date}T${TO}`
            }
        });
        const {data: {count, results}} = resp;
        const avg = calculate_avg(count, results).toFixed(3);
        console.log(`Average usage for ${date}: ${avg}`);
    } catch (e) {
        console.error(e);
    }
})();
