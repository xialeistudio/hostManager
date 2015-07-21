/**
 * @author xialei <xialeistudio@gmail.com>
 */
var module = angular.module('app', [
    'app.controllers',
    'app.services'
]);
module.config(function($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
});
module.run(function($rootScope) {
    $rootScope.debug = true;
});