/* eslint-disable @typescript-eslint/no-explicit-any */
import { Abis } from 'tempo.ts/viem';

console.log("Functions in StablecoinExchange:");
Abis.stablecoinExchange.forEach((item: any) => {
  if (item.type === 'function') {
    console.log(`- ${item.name}(${item.inputs.map((i: any) => i.type).join(',')})`);
  }
});
