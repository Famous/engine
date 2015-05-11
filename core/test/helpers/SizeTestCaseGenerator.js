'use strict';

var testCases = [];
for (var sizeModeX = 0; sizeModeX < 3; sizeModeX++) {
    for (var sizeModeY = 0; sizeModeY < 3; sizeModeY++) {
        for (var sizeModeZ = 0; sizeModeZ < 3; sizeModeZ++) {
            testCases.push({
                parentSize: [(Math.random() * 200) | 0, (Math.random() * 200) | 0, (Math.random() * 200) | 0],
                spec: {
                    size: {
                        sizeMode: [sizeModeX, sizeModeY, sizeModeZ],
                        proportional: [(Math.random()*100 | 0)/100, (Math.random()*100 | 0)/100, (Math.random()*100 | 0)/100],
                        differential: [(Math.random() * 100) | 0, (Math.random() * 100) | 0, (Math.random() * 100) | 0],
                        absolute: [(Math.random() * 100) | 0, (Math.random() * 100) | 0, (Math.random() * 100) | 0]
                    }
                },
                expectedResult: new Float32Array(3)
            });
        }
    }
}

console.log(JSON.stringify(testCases, null, 4));
