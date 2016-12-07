#! /usr/bin/env node

console.log("testScript called..");

return function () {
  console.log("testScript ended..")
  process.exit(0);
};
