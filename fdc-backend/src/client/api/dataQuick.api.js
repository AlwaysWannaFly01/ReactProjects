// 数据字典 API
import makeRequest from './makeRequest'

// 获取主用途列表
export function getUsageType() {
	// return makeRequest({
	//   url: '/fdc/dict/usageType'
	// })
	// 根据产品、后台需求暂时写死这个字典，勿喷
	// eslint-disable-next-line
	return { code:'200', message: 'success', data: [{ code: '1001001', name: '居住' }, {'code':'1001002','name':'居住(别墅)'},{'code':'1001003','name':'居住(洋房)'},{'code':'1001016','name':'居住(商住)'},{'code':'1001004','name':'商业'},{'code':'1001005','name':'办公'},{'code':'1001006','name':'工业'},{'code':'1001015','name':'公寓'},{'code':'1001007','name':'商业、居住'},{'code':'1001008','name':'商业、办公'},{'code':'1001009','name':'办公、居住'},{'code':'1001010','name':'停车场'},{'code':'1001011','name':'酒店'},{'code':'1001012','name':'加油站'},{'code':'1001013','name':'综合'},{'code':'1001014','name':'其他'}]}
}

// 加载来源字典
export function getPriceSource() {
	return makeRequest({
		url: '/fdc/dict/priceSourceType',
		method: 'GET'
	})
}

// 模糊查询楼盘名称列表
export function fetchProjectsList(params) {
	return makeRequest({
		url: '/fdc/projects/search',
		data: params
	})
}

// 模糊查询楼栋列表
export function fetchBuidingList(params) {
	return makeRequest({
		url: '/fdc/building/list',
		data: params
	})
}

// 模糊查询物理层列表
export function fetchFloorList(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData/listHouseData',
		data: params
	})
}

// 获取楼盘详情
export function getProjectDetail(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData/projectDetail',
		data: params
	})
}

// 获取楼栋详情
export function getBuildingDetail(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData/buildingDetail',
		data: params
	})
}

// 获取房号详情
export function getHouseDetail(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData/houseDetail',
		data: params
	})
}

// 获取省市区
export function getProvinceCityList(params) {
	return makeRequest({
		url: '/fdc/visitCities/authorizedDistrict',
		data: params
	})
}

// 获取别名类型
export function getAliaType() {
	return makeRequest({
		url: '/fdc/dict/aliasType'
	})
}

// 获取地址类型
export function getAddrType() {
	return makeRequest({
		url: '/fdc/dict/addressType'
	})
}

// 获取自动估价
export function fetchValuation(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData/evaluate',
		data: params
	})
}

//保存快捷数据操作
export function saveQuickMaintainData(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData',
		data: params,
		method: 'POST'
	})
}

// 删除相关楼盘名称时校验匹配
export function verifyProjectName(params) {
	return makeRequest({
		url: '/fdc/project/aliases/isCompelteMatch',
		data: params,
		method: 'GET'
	})
}

// 删除相关地址时校验匹配
export function verifyProjectAddress(params) {
	return makeRequest({
		url: '/fdc/project/address/isCompelteMatch',
		data: params,
		method: 'GET'
	})
}


//补全房号
export function fetchCompleteHouseData(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData/completeHouseData',
		data: params
	})
}

// 快捷数据详情
export function fetchQuickDataDetail(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData/detail',
		data: params,
		method: 'GET'
	})
}

//校验URL参数
export function fetchValidateRegion(params) {
	return makeRequest({
		url: '/fdc/quickMaintainData/validateRegion',
		data: params,
		method: 'GET'
	})
}

//校验相同楼盘名称
export function isMatchBatchProject(params) {
	return makeRequest({
		url: '/fdc/project/aliases/IsMatchBatchProject/projectName',
		data: params,
		method: 'GET'
	})
}

// 校验相同城市下是否有相同的相关楼盘地址
export function addressValidate(params) {
	return makeRequest({
		url: '/fdc/project/address/validate',
		data: params,
		method: 'GET'
	})
}
