/**
 * @author xialei <xialeistudio@gmail.com>
 */
var module = angular.module('app.controllers', []);
module.controller('RootCtrl', function($scope, message) {
    //假数据
    $scope.data = [
        {
            name: "默认组", records: [
            {domain: "www.baidu.com", address: "127.0.0.1", enabled: 1},
            {domain: "www.qq.com", address: "127.0.0.1", enabled: 0}
        ]
        },
        {
            name: "开发组",
            records: [
                {domain: "www.tencent.com", address: "127.0.0.1", enabled: 1}
            ]
        }
    ];

    $scope.showRecordModal = false;
    $scope.showGroupModal = false;
    $scope.record = {};
    $scope.group = {};

    /**
     * 控制分组浮层的显隐
     * @param data
     * @param clean
     */
    $scope.controlGroup = function(data, clean) {
        $scope.showGroupModal = data;
        if(clean) {
            $scope.group = {};
        }
    };
    /**
     * 控制记录浮层的显隐
     * @param group
     * @param isShow
     * @param clean
     */
    $scope.controlRecord = function(group, isShow, clean) {
        $scope.showRecordModal = isShow;
        $scope.group = group;
        if(clean) {
            $scope.record = {};
        }
    };
    /**
     * 上传至云端
     */
    $scope.upload = function() {
    };
    /**
     * 从云端下载
     */
    $scope.download = function() {
    };
    /**
     * 输出到系统domains
     */
    $scope.output = function() {
    };
    /**
     * 读取系统domains
     */
    $scope.input = function() {
    };
    /**
     * 切换
     * @param record
     */
    $scope.toggle = function(record) {
        record.enabled = !record.enabled;
        //写入系统
    };

    /**
     * 添加记录
     */
    $scope.addRecord = function(record, e) {
        e.preventDefault();

        if(!record.domain || !record.domain.trim()) {
            message.alert('请输入域名');
            return;
        }
        if(!/^\w+(\.\w+)+$/.test(record.domain.trim())) {
            message.alert('域名格式错误');
            return;
        }
        if(!record.address || !record.address.trim()) {
            message.alert('请输入IP地址');
            return;
        }
        if(!/^\d{1,3}(\.\d{1,3}){3}$/.test(record.address.trim())) {
            message.alert('IP地址格式错误');
            return;
        }
        //检测当前分组是否有该记录
        if($scope.group.records.some(function(item) {
                return item.domain == record.domain && item.address == record.address;
            })) {
            message.alert('记录已存在');
            return;
        }
        $scope.group.records.push({
            domain: record.domain.trim(),
            address: record.address.trim()
        });
        $scope.controlRecord(null, false, true);
    };

    /**
     * 添加分组
     */
    $scope.addGroup = function(group, e) {
        e.preventDefault();
        if(!group.name || !group.name.trim()) {
            message.alert('请输入分组名称');
            return;
        }
        //检查本地是否存在该分组
        if(!group.records && $scope.data.some(function(item) {
                return group.name.trim() == item.name;
            })) {
            message.alert('分组名已存在');
            return;
        }
        //写入分组
        if(!group.records) {
            $scope.data.push({
                name: group.name.trim(),
                records: []
            });
        }
        $scope.showGroupModal = false;
        $scope.group = {};
    };

    /**
     * 编辑分组
     * @param group
     */
    $scope.editGroup = function(group) {
        $scope.group = group;
        $scope.controlGroup(true);
    };

    /**
     * 删除分组
     * @param group
     */
    $scope.removeGroup = function(group) {
        message.confirm('确定删除吗?').then(function() {
            $scope.data.splice($scope.data.indexOf(group), 1);
        });
    };
});