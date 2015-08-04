/**
 * @author xialei <xialeistudio@gmail.com>
 */
var module = angular.module('app.controllers', []);
module.controller('RootCtrl', function($scope, message, $http, io) {
	//假数据
	$scope.data = [];
	//读取localStorage将openid设置
	$scope.openid = localStorage.getItem('openid') || '';
	/**
	 * 获取系统信息
	 */
	$scope.getSystemInfo = function() {
		chrome.system.cpu.getInfo(function(info) {
			message.debug(info);
		});
	};
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
		if (clean) {
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
		if (clean) {
			$scope.record = {};
		}
	};
	$scope.$watch('openid', function(value) {
		localStorage.setItem('openid', value)
	});
	/**
	 * 上传至云端
	 */
	$scope.upload = function() {
		if ($scope.openid == '') {
			message.alert('请输入key');
			return;
		}
		//发起远程请求
		$http.post('http://xialeihome.sinaapp.com/host/index/upload', $scope.data, {
			params: {
				key: $scope.openid
			}
		}).success(function(data) {
			if (data.error) {
				message.alert(data.error);
				return;
			}
			message.alert('上传完成，总共上传['+data.total+']条记录，同步['+data.async+']条记录.');
		});
	};
	/**
	 * 从云端下载
	 */
	$scope.download = function() {
		if($scope.openid == ''){
			message.alert('请输入key');
			return;
		}
		$http.get('http://xialeihome.sinaapp.com/host/index/download',{
			params:{
				key:$scope.openid
			}
		}).success(function(data) {
			$scope.data = data;
			$scope.output();
		});
	};
	/**
	 * 输出到系统hosts
	 */
	$scope.output = function() {
		var str = '';
		$scope.data.forEach(function(group) {
			str += '\n# ' + group.name + '\n';
			group.records.forEach(function(record) {
				var line;
				line = [record.enabled ? record.address : '#' + record.address, record.domain + '\n'].join('\t');
				str += line;
			});
		});
		if (!$scope.hosts) {
			return;
		}
		io.saveTextFile($scope.hosts, str).then(function() {
			console.info('写入完成')
		}, function(error) {
			console.error(error);
		});
	};
	/**
	 * 读取系统hosts
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
		$scope.output();
	};
	/**
	 * 添加记录
	 */
	$scope.addRecord = function(record, e) {
		e.preventDefault();
		if (!record.domain || !record.domain.trim()) {
			message.alert('请输入域名');
			return;
		}
		if (!/^\w+(\.\w+)+$/.test(record.domain.trim())) {
			message.alert('域名格式错误');
			return;
		}
		if (!record.address || !record.address.trim()) {
			message.alert('请输入IP地址');
			return;
		}
		if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(record.address.trim())) {
			message.alert('IP地址格式错误');
			return;
		}
		//检测当前分组是否有该记录
		if ($scope.group.records.some(function(item) {
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
		if (!group.name || !group.name.trim()) {
			message.alert('请输入分组名称');
			return;
		}
		//检查本地是否存在该分组
		if (!group.records && $scope.data.some(function(item) {
					return group.name.trim() == item.name;
				})) {
			message.alert('分组名已存在');
			return;
		}
		//写入分组
		if (!group.records) {
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
	/**
	 * 分组切换
	 * @param group
	 */
	$scope.toggleGroup = function(group) {
		group.open = !group.open;
	};
	/**
	 * 初始化
	 */
	$scope.init = function() {
		io.getSystemPath().then(function(data) {
			$scope.hosts = data.path + '/drivers/etc/hosts';
			//读取文件
			io.getTextFile($scope.hosts).then(function(data) {
				//#空格=>分组名称
				//#记录=>记录
				var str = data.data;
				var lines = str.split('\n');
				var groups = [];
				lines.forEach(function(item, lineNumber) {
					if (item != "" && item != "\n") {
						if (item.indexOf('# ') != -1) {
							var group = item.substring(item.indexOf('# ') + 2, item.length);
							groups.push({
								name: group,
								line: lineNumber + 1
							});
						}
					}
				});
				for (var i = 0; i < groups.length; i++) {
					var area;
					if (i < groups.length - 1) {
						area = [groups[i].line, groups[i + 1].line - 1];
					}
					else {
						area = [groups[i].line, lines.length];
					}
					groups[i].records = [];
					groups[i].open = true;
					//读取文件插入分组
					for (var t = area[0]; t <= area[1]; t++) {
						if (lines[t] != undefined && lines[t] != "" && lines[t] != "\n") {
							var isEnabled = lines[t].indexOf('#') == -1;
							if (!isEnabled) {
								lines[t] = lines[t].substring(1, lines[t].length);
							}
							var record = lines[t].split('\t');
							delete  groups[i].line;
							if (record.length == 2) {
								groups[i].records.push({
									domain: record[1],
									address: record[0],
									enabled: isEnabled
								});
							}
						}
					}
				}
				$scope.data = groups;
			}, function(error) {
				message.alert(error.message);
			});
		}, function(error) {
			message.alert(error.message);
		});
		$scope.input();
	};
	$scope.init();
});