const fs = require("fs");
const path = require("path");

let conversionMap = {
    decimalsForCurrencies: {},
    conversionRates: {}
};

const prepareForMapping = function () {
    for (const currency in conversionMap.decimalsForCurrencies) {
        if (!Object.keys(conversionMap.conversionRates).includes(currency)) {
            conversionMap.conversionRates[currency] = {};
        }
    }
    for (const curBase in conversionMap.conversionRates) {
        for (const base in conversionMap.conversionRates) {
            if (!Object.keys(conversionMap.conversionRates[curBase]).includes(base)) {
                conversionMap.conversionRates[curBase][base] = -1;
            }
        }
    }
    for (const base in conversionMap.conversionRates) {
        for (const terms in conversionMap.conversionRates[base]) {
            if (base === terms) {
                conversionMap.conversionRates[base][terms] = 1;
            }
            if (conversionMap.conversionRates[base][terms] === -1 && conversionMap.conversionRates[terms][base] !== -1) {
                conversionMap.conversionRates[base][terms] = 1 / conversionMap.conversionRates[terms][base];
            }
        }
    }
};

const unmappedCount = function () {
    let count = 0;
    for (const base in conversionMap.conversionRates) {
        for (const terms in conversionMap.conversionRates[base]) {
            if (conversionMap.conversionRates[base][terms] === -1) {
                count++;
            }
        }
    }
    return count;
};

const createMapping = function () {
    let postCount = unmappedCount(), preCount;
    do {
        preCount = postCount;

        for (const base in conversionMap.conversionRates) {
            for (const terms in conversionMap.conversionRates[base]) {
                if (conversionMap.conversionRates[base][terms] !== 0 && conversionMap.conversionRates[base][terms] !== -1) {
                    for (const innerBase in conversionMap.conversionRates) {
                        if (
                            innerBase !== base &&
                            !isNaN(conversionMap.conversionRates[innerBase][base]) &&
                            conversionMap.conversionRates[innerBase][base] !== -1 &&
                            conversionMap.conversionRates[innerBase][terms] === -1
                        ) {
                            conversionMap.conversionRates[innerBase][terms] = base;
                        }
                    }
                }
            }
        }

        postCount = unmappedCount();
    } while (postCount !== 0 && preCount !== postCount);
};

fs.readFile(path.join(__dirname, "/inputs.json"), function (err, data) {
    if (err) {
        console.error("Failed to read from inputs.json");
    } else  {
        conversionMap = JSON.parse(data);
        prepareForMapping();
        createMapping();
        fs.writeFile(path.join(__dirname, "/decimal-rateMap-info.json"), JSON.stringify(conversionMap), function(error) {
            if (error) {
                console.error("Failed to write to decimal-rateMap-info.json");
            } else  {
                console.log("Decimal and RateMap written to decimal-rateMap-info.json");
            }
        });
    }
});