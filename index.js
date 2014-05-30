var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '')
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  if(result === null)
	 result = []
  return result
}





var DI = module.exports = function(){
	this._global.di = this;
	var di = this;
	this.service('di', function(){
		return di;
	});
};

var proto = DI.prototype;

proto._store = {};
proto._global = function(closure){
	return this.di.invoke(closure);
};


proto.provide = function(key, closure) {
	var di = this;
	this._store[key] = {
		key:key,
		closure:closure
	};

	this._global.__defineGetter__(key, function(){
		return di.get(key);
	});
};

proto.service = function(key, closure) {
	var di = this;
	this.provide(key, function(){
		return di.invoke(closure);
	});
};

proto.value = function(key, val) {
	this.provide(key, function(){
		return val;
	});
};

proto.factory = function(key, factory) {
	this.provide(key, function(){
		return factory;
	});
};





proto.invoke = function(closure, locals) {
	var params = getParamNames(closure);

	return closure.apply(closure, this.annotate(params, locals));
};

proto.annotate = function(params, locals) {
	locals = locals || {};
	var result = [];
	for(var i in params) {
		var param = params[i];

		if(locals[param]) {
			result.push(locals[param]);
		} else {
			result.push( this.get(param) );
		}
	}
	return result;
};


proto.get = function(key) {

	if(this._store[key]) {
		var obj = this._store[key];

		if(!obj.service) {
			return obj.service = this.invoke(obj.closure);
		} else {
			return obj.service;
		}


	} else {
		console.error('Provider `' + key + '` not found!');
	}
};

proto.registerGlobal = function(name){
	name = name || 'di';
	var di = this;
	global[name] = this._global;
	this.service('name', function(){
		return di;
	});
};


