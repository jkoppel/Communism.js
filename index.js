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

    useFunctionRation(worker, callee) {
        if (this.allocations.has(worker.id) &&
            this.allocations.get(worker.id).has(callee)) {


                const numUses = this.allocations.get(worker.id).get(callee);
                if (numUses > 0) {
                    this.allocations.get(worker.id).set(callee, numUses - 1);
                    return;
                }
        }

        throw new Error(`Worker ${worker.id} has exceeded its allocation for function ${callee.name}!`);
    }
}

class PlannningCommittee {

    constructor() {
        this.proposedAllocations = new Map();
    }

    ration(worker, callee, numUses) {
        if (callee[LIBERATED] === true) {
            callee = callee[CAPITALIST_VERSION];
        }

        if (!this.proposedAllocations.has(worker.id)) {
            this.proposedAllocations.set(worker.id, new Map());
        }

        this.proposedAllocations.get(worker.id).set(callee, numUses);

        console.debug(`Rationed ${worker.id} to ${callee.name} for ${numUses} uses`);
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

        currentFiveMinutePlan.useFunctionRation(arguments.callee.caller[WORKER], originalFunction);

        const result = originalFunction.apply(this, arguments);

        // TODO: Figure out how deep into capitalist territory the revolution can strike
        //       before the order begins to crumble.
        // return makeLiberatedValue(result);
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

const WORKER = Symbol('worker');

let WORKER_COUNTER = 0;

class Worker {
    constructor(abilities) {
        this.abilities = abilities;
        this.id = WORKER_COUNTER++;
        
        for (const key in abilities) {
            abilities[key][WORKER] = this;
            this[key] = abilities[key];
        }
    }
}

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

const worker1 = new Worker({consume: () => console.log(fs.readFileSync('README.md', 'utf8'))});
const worker2 = new Worker();
const worker3 = new Worker();

const revolution = new Proletariat([worker1, worker2, worker3]).unite();

// Workers seize the means of production
var fs = revolution.seize('fs');

// Set a five-minute plan
const committee = new PlannningCommittee();
committee.ration(worker1, fs.readFileSync, 2);
committee.adopt();

// Use the coupons 
worker1.consume();
worker1.consume();

// Errors because worker1 has exceeded its allocation and needs to wait for the next five-minute plan
worker1.consume(); 