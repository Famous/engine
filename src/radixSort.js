var radixBits = 11,
    maxRadix = 1 << (radixBits),
    radixMask = maxRadix - 1,
    buckets = new Array(maxRadix * Math.ceil(64 / radixBits)),
    msbMask = 1 << ((32 - 1) % radixBits),
    lastMask = (msbMask << 1) - 1,
    passCount = ((32 / radixBits) + 0.999999999999999) | 0,
    maxOffset = maxRadix * (passCount - 1);

var buffer = new ArrayBuffer(4);
var floatView = new Float32Array(buffer, 0, 1);
var intView = new Int32Array(buffer, 0, 1);

function floatToInt (k) {
    floatView[0] = k;
    return intView[0];
}

function intToFloat(k) {
    intView[0] = k;
    return floatView[0];
}

function sort(list, registry) {
    var pass = 0;
    var out = [];

    var i, j, k, n, div, offset, swap, id, sum, tsum, size;

    passCount = ((32 / radixBits) + 0.999999999999999) | 0;

    for (i = 0, n = maxRadix * passCount; i < n; i++) buckets[i] = 0;

    for (i = 0, n = list.length; i < n; i++) {
        div = floatToInt(comp(i));
        div ^= div >> 31 | 0x80000000;
        for (j = 0, k = 0; j < maxOffset; j += maxRadix, k += radixBits) {
            buckets[j + (div >>> k & radixMask)]++;
        }
        buckets[j + (div >>> k & lastMask)]++;
    }

    for (j = 0; j <= maxOffset; j += maxRadix) {
        for (id = j, sum = 0; id < j + maxRadix; id++) {
            tsum = buckets[id] + sum;
            buckets[id] = sum - 1;
            sum = tsum;
        }
    }
    if (--passCount) {
        for (i = 0, n = list.length; i < n; i++) {
            div = floatToInt(comp(i));
            out[++buckets[div & radixMask]] = mutator(i, div ^= div >> 31 | 0x80000000);
        }
        swap = out, out = list, list = swap;
        while (++pass < passCount) {
            for (i = 0, n = list.length, offset = pass * maxRadix, size = pass * radixBits; i < n; i++) {
                div = floatToInt(            comp(i));
                out[++buckets[offset + (div >>> size & radixMask)]] = list[i];
            }
            swap = out, out = list, list = swap;
        }
    }

    for (i = 0, n = list.length, offset = pass * maxRadix, size = pass * radixBits; i < n; i++) {
        div = floatToInt(comp(i));
        out[++buckets[offset + (div >>> size & lastMask)]] = mutator(i, div ^ (~div >> 31 | 0x80000000));
    }

    return out;

    function comp (i) {
        var key = list[i];
        return registry[key].uniformValues[1][14];
    }

    function mutator (i, value) {
        var key = list[i];
        registry[key].uniformValues[1][14] = intToFloat(value);
        return key;
    }
}

module.exports = sort;
