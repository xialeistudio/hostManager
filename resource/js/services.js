/**
 * @author xialei <xialeistudio@gmail.com>
 */
var module = angular.module('app.services', []);
module.service('message', function($rootScope, $q) {
    /**
     * 调试方法
     * @param object
     */
    this.debug = function(object) {
        if(!$rootScope.debug) {
            return;
        }
        if(typeof  object == "object") {
            object = JSON.stringify(object);
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