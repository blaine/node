var submodule;

exports.prime = function () {
  submodule = require('./subhotload');
}

exports.hello = function () {
  return submodule.hello();
}
