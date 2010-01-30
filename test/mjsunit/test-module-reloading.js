process.mixin(require("./common"));

debug("load test-module-reloading.js");

test_status = "FAILED";

var sys = require('sys');

var hlPath = __dirname + "/fixtures/hotload";

// Clean up just in case
try {
  posix.unlink(hlPath).wait();
} catch (e) {
  // ignore
}

// no node builtin symlink() in node yet, punting
sys.exec("ln -s " + hlPath + ".1 " + hlPath).wait();

// First we load the code in hotload.1, and prime a sub-require that happens
// there.
var preswitch = require("./fixtures/hotload/hotload");
preswitch.prime();

assert.equal(preswitch.hello(), "Hello from hotload.1");

// Next, unload the cache in *this* module for ./fixtures/hotload
module.unCacheModule("./fixtures/hotload/hotload");

// this approach is obviously not atomic, but there are atomic ways to do it.
posix.unlink(hlPath);
sys.exec("ln -s " + hlPath + ".2 " + hlPath).wait();

// Now reload ./fixtures/hotload, now pointing at ./fixtures/hotload.2
var postswitch = require("./fixtures/hotload/hotload");
postswitch.prime();

assert.equal(postswitch.hello(), "Hello from hotload.2");

// The two hello() methods should be different!
assert.notEqual(preswitch.hello(), postswitch.hello());
assert.equal(preswitch.hello(), "Hello from hotload.1");
assert.equal(postswitch.hello(), "Hello from hotload.2");

// Now, just to be sure that preswitch wasn't harmed in the process, have it
// re-require its internal require, which should be cached.
preswitch.prime();

// The two hello() methods should still be different.
assert.notEqual(preswitch.hello(), postswitch.hello());
assert.equal(preswitch.hello(), "Hello from hotload.1");
assert.equal(postswitch.hello(), "Hello from hotload.2");

test_status = "PASSED"

// Clean up.
try {
  posix.unlink(hlPath).wait();
} catch (e) {
  // ignore
}

process.addListener("exit", function () {
  debug("test-module-reloading " + test_status);
});
