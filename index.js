// #######################################
//              Time helpers
// #######################################

class TimeUnits {
    static minutes(minutes) {
        return this.seconds(minutes * 60);
    }

    static seconds(seconds) {
        return seconds * 1000;
    }
}

// #######################################
//            Five-minute plans
// #######################################

// ####################
//         Main
// ####################

let currentFiveMinutePlan;

class FiveMinutePlan {
    constructor(allocations) {
        this.allocations = allocations;
    }

    useFunctionRation(caller, callee) {
        if (this.allocations.has(caller) &&
            this.allocations.get(caller).has(callee)) {


                const numUses = this.allocations.get(caller).get(callee);
                if (numUses > 0) {
                    this.allocations.get(caller).set(callee, numUses - 1);
                    return;
                }
        }

        throw new Error(`Function ${caller.name} has exceeded its allocation for function ${callee.name}!`);
    }
}

class PlannningCommittee {

    constructor() {
        this.proposedAllocations = new Map();
    }

    ration(caller, callee, numUses) {
        if (callee[LIBERATED] === true) {
            callee = callee[CAPITALIST_VERSION];
        }

        if (!this.proposedAllocations.has(caller)) {
            this.proposedAllocations.set(caller, new Map());
        }

        this.proposedAllocations.get(caller).set(callee, numUses);

        console.debug(`Rationed ${caller} to ${callee} for ${numUses} uses`);
    }

    adopt() {
        currentFiveMinutePlan = new FiveMinutePlan(this.proposedAllocations);
        this.proposedAllocations = new Map();
        setTimeout(() => this.adopt(), TimeUnits.minutes(5));
    }

}


// #######################################
//     Seizing the means of production
// #######################################

const LIBERATED = Symbol('liberated');
const CAPITALIST = Symbol('capitalist');
const CAPITALIST_VERSION = Symbol('capitalistVersion');

function makeLiberatedFunction(originalFunction) {
    if (originalFunction[LIBERATED] === true) {
        return originalFunction;
    } else {
        originalFunction[CAPITALIST] = true;
    }

    function liberatedFunction() {
        if (currentFiveMinutePlan === undefined) {
            throw new Error('The revolution has not completed!');
        }

        if (arguments.callee.caller === null) {
            /* 
             * Known situations where this occurs:
             *   - Top-level caller
             *   - Native caller
             */

            return originalFunction.apply(this, arguments);
        }

        currentFiveMinutePlan.useFunctionRation(arguments.callee.caller, originalFunction);

        const result = originalFunction.apply(this, arguments);

        //return makeLiberatedValue(result);
        return result;
    }

    liberatedFunction[LIBERATED] = true;
    liberatedFunction[CAPITALIST_VERSION] = originalFunction;
    return liberatedFunction;
}

function seizeObject(object) {
    if (object[LIBERATED] === true) {
        return;
    }

    object[LIBERATED] = true;

    for (const key in object) {
        object[key] = makeLiberatedValue(object[key]);
    }

    return object;
}

function makeLiberatedValue(originalValue) {
    if (originalValue[LIBERATED] === true) {
        return originalValue;
    }

    if (typeof originalValue === 'function') {
        return makeLiberatedFunction(originalValue);
    } else if (typeof originalValue === 'object') {
        seizeObject(originalValue);
        return originalValue;
    } else {
        return originalValue;
    }
}

function seize(packageName) {
    const package = require(packageName);
    seizeObject(package);
    return package;
}


// #######################################
//              Workers unite!
// #######################################

class Worker {}

class Proletariat {
    constructor(workers) {
        this.workers = workers;
    }

    unite() {
        return {
            seize: seize,
        };
    }
}


// #######################################
//           Viva la revolución!
// #######################################

const [worker1, worker2, worker3] = [new Worker(), new Worker(), new Worker()];
const revolution = new Proletariat([worker1, worker2, worker3]).unite();

// Workers seize the means of production
const path = revolution.seize('path');

function foo() {
    console.log(path.join('foo', 'bar'));
}

// Set a five-minute plan
const committee = new PlannningCommittee();
committee.ration(foo, path.join, 2);
committee.adopt();

// Use the coupons 
console.log(foo());
console.log(foo());
console.log(foo());