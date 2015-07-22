/**
 * @author xialei <xialeistudio@gmail.com>
 */
var module = angular.module('app.services', []);
module.run(function(io) {
    io._handler = document.querySelector('#plugin');
});
module.service('message', function($rootScope, $q) {
    /**
     * 调试方法
     * @param object
     */
    this.debug = function(object) {
        if(!$rootScope.debug) {
            return;
        }
        console.log(object);
    };
    /**
     * 消息提示
     * @param msg
     */
    this.alert = function(msg) {
        var defer = $q.defer();
        var modal = document.querySelector('.alert-modal');
        if(typeof  msg == "object") {
            msg = JSON.stringify(msg);
        }
        modal.querySelector('.msg>.text').innerHTML = msg;
        modal.style.display = 'block';
        angular.element(modal.querySelector('.msg>.btns>.btn')).unbind("click").bind("click", function() {
            modal.style.display = 'none';
            defer.resolve();
        });
        return defer.promise;
    };

    /**
     * 确认框
     * @param msg
     */
    this.confirm = function(msg) {
        var defer = $q.defer();
        var modal = document.querySelector('.confirm-modal');
        if(typeof  msg == "object") {
            msg = JSON.stringify(msg);
        }
        modal.querySelector('.msg>.text').innerHTML = msg;
        modal.style.display = 'block';
        angular.element(modal.querySelector('.msg>.btns>.btn-info')).unbind("click").bind("click", function() {
            modal.style.display = 'none';
            defer.resolve();
        });
        angular.element(modal.querySelector('.msg>.btns>.btn-warning')).unbind("click").bind("click", function() {
            modal.style.display = 'none';
            defer.reject();
        });
        return defer.promise;
    };
    return this;
});

module.service('io', function($q) {
    this._handler = null;
    var _this = this;
    /**
     * 获取系统文件目录
     * @returns {qFactory.Deferred.promise|*|td.g.promise}
     */
    this.getSystemPath = function() {
        var defer = $q.defer();
        try {
            defer.resolve({
                path: _this._handler.getSystemPath()
            });
        } catch(e) {
            defer.reject({
                error: e.message
            });
        }
        return defer.promise;
    };
    /**
     * 读取文本文件
     * @param path
     * @returns {qFactory.Deferred.promise|*|td.g.promise}
     */
    this.getTextFile = function(path) {
        var defer = $q.defer();
        try {
            var data = _this._handler.getTextFile(path);
            defer.resolve({
                data: data
            });
        } catch(e) {
            defer.reject({
                error: e.message
            });
        }
        return defer.promise;
    };
    /**
     * 保存文本文件
     * @param path
     * @param str
     */
    this.saveTextFile = function(path, str) {
        var defer = $q.defer();
        try {
            _this._handler.saveTextFile(path, str);
            defer.resolve();
        } catch(e) {
            defer.reject({
                error: e.message
            });
        }
	    return defer.promise;
    };
    return this;
});