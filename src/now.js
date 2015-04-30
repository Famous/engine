var now = typeof performance !== 'undefined' ? function() {
    return performance.now();
} : Date.now;

module.exports = now;
