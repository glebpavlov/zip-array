const RANDOM_NUMBERS_COUNT = 900;
export class Serializer {
    static stringify(array: number[]) {
        /**
         * Сначала ведем подсчет всех повторов чисел
         * @param accumulator
         * @param currentValue
         */
        const counterHandler = (accumulator: Map<number, number>, currentValue: number) => {
            const newCount = (accumulator.get(currentValue) || 0) + 1;
            accumulator.set(currentValue, newCount);
            return accumulator;
        };
        const sumTmp = array.reduce(counterHandler, new Map());

        /**
         * теперь инвертируем Map, делаем ключём количество вхождений
         * пояснение:
         * делаем ключ уникальным, т.к. эффективнее написать, что у нас 3 раза повторяются числа 1, 5 и 6, чем написать, что число 1 повторяется 3 раза, число 5 повторяется 3 раза, число 6 повторяется 3 раза
         * @param accumulator
         * @param number
         * @param count
         */
        const counterZipHandler = (accumulator: Map<number, Set<number>>, [number, count]: number[]) => {
            if (!accumulator.has(count)) {
                accumulator.set(count, new Set([number]));
                return accumulator;
            }
            (accumulator.get(count) as Set<number>).add(number);
            return accumulator;
        }

        const sumZipTmp = [...sumTmp].reduce(counterZipHandler, new Map());


        Math.max(...sumZipTmp.keys())

        const serializeHandler = (accumulator: string, [count, values]: [number, Set<number>], index: number)=>{
            const fullLength = sumZipTmp.size;
            const radix16Count = count.toString(radix);
            // меняем radix для экономии места. 10 = a, 900 = s4 и т.д. в итоге на каждое число можно сэкономить до 1 символа
            const radix16Numbers = [...values].map(number => number.toString(radix))
            return `${accumulator}${count > 1?radix16Count + ':':''}${radix16Numbers.join(',')}${fullLength === index +1? '': ';'}`
        };

        return [...sumZipTmp].reduce(serializeHandler, '');
    }

    static parse(str: string): number[] {
        const reduceHandler = (accumulator: number[], [a, b]: [string, string?])=>{

            const count = !b?1: parseInt(a, radix);
            const values = (b?b: a).split(',').map(hex=>parseInt(hex, radix))
            // @ts-ignore
            return [...accumulator, Array(count).fill(values)];
        }
     // @ts-ignore
       return str.split(';')
           .map((optimizedVal)=>optimizedVal.split(':'))
           // @ts-ignore
           .reduce(reduceHandler, [] as number[])
           .flat(2);
    }
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randArray = Array(RANDOM_NUMBERS_COUNT).fill(null).map(() => getRandomInt(1, 300));
const radix = 32;

const optimizedString = Serializer.stringify(randArray);

const parsedArray = Serializer.parse(optimizedString);

const classicString = getClassicString(randArray);

function percentage(partialValue: number, totalValue: number) {
    return parseFloat((100 -(100 * partialValue) / totalValue).toFixed(2));
}



function getClassicString(array: number[]) {
    return JSON.stringify(array);
}

console.log(`Optimized String length: ${optimizedString.length}`);
console.log(`Classic String length: ${classicString.length}`);
console.log(`Efficiency: ${percentage(optimizedString.length, classicString.length)}%`);
console.log(`Amount of elements: ${randArray.length}`);


