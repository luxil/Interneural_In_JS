/**
 * Created by Linh Do on 14.08.2017.
 */
function fibo(n) {
    function fiboHelper(m, a, b) {
        if (m < n) {
            var k = a + b;
            a = b;
            b = k;
            return fiboHelper(++m, a, b);
        } else {
            return a;
        }
    }
    postMessage(fiboHelper(0, 0, 1));
}

// Run once

SimpleWorker.run({
    func: fibo,
    args: [123],
    success: function(res) {
        console.log(res);
    },
    error: function(err) {
        console.log(err);
    }
});

// Create a worker for later use

var fiboWorker = new SimpleWorker({
    func: fibo,
    success: function(res) {
        console.log(res);
    },
    error: function(err) {
        console.log(err);
    }
});

fiboWorker.run(123);
fiboWorker.run(456);