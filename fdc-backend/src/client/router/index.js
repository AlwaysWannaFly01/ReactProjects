export default {
  // 为什么不引入常量管理？
  INDEX: '/',
  // 控制台
  HOME: '/home',

  // 房产数据 模块
  PROPERTY: '/property',
  // 房产数据 / 住宅 / 基础数据
  RES_BASEINFO: '/property/res/base-info',
  RES_BASEINFO_ADD: '/property/res/base-info/add',

  RES_BUILD_RATIO: '/property/res/base-info/ratio', // 房产数据 / 住宅 / 建筑物类型比值
  // 房产数据 / 住宅 / 片区绘制
  RES_AREA_DRAW: '/property/res/base-info/draw',
  // 房产数据 / 住宅 / 片区绘制 / 片区经纬度导入
  RES_AREA_DRAW_LNGLAT: '/property/res/base-info/draw/lnglat',

  // 房产数据 / 住宅 / 楼盘集合
  RES_PROJECT_SET: '/property/res/base-info/project-set',
  // 房产数据 / 住宅 / 楼盘集合详情
  RES_PROJECT_SET_DETAIL: '/property/res/base-info/project-set/detail',

  // 房产数据 / 住宅 / 案例基础数据
  RES_CASEINFO: '/property/res/case-info',
  // 房产数据 / 住宅 / 案例基础数据 / 新增 or 编辑
  RES_CASEINFO_EDIT: '/property/res/case-info/edit',
  // 房产数据 / 住宅 / 案例基础数据 / 楼盘名称错误条数
  RES_CASEINFO_ERROR: '/property/res/case-info/import/error',
  // 房产数据 / 住宅 / 楼栋信息
  RES_BUILD_INFO: '/property/res/base-info/build-info',
  RES_BUILD_INFO_ADD: '/property/res/base-info/build-info/add',
  // 房产数据/ 住宅 / 项目图片
  RES_PRO_IMAGE: '/property/res/base-info/pro-image',
  // 房产数据 / 住宅/ 楼盘配套
  RES_PROJECT_RESOURCE: '/property/res/base-info/resoure',
  RES_PROJECT_RESOURCE_EDIT: '/property/res/base-info/resource/edit',
  // 房产数据 / 住宅 / 房号标准系数差
  RES_HOUSE_STAND: '/property/res/base-info/house-stand',
  // 房产数据 / 住宅 / 城市标准差V3.0
  RES_HOUSE_STAND_THREE: '/property/res/base-info/house-stand-three',
  // 房产数据 / 住宅 / 租金城市标准差V3.0
  RENT_HOUSE_STAND_THREE: '/property/res/base-info/house-rent-three',
  //// 房产数据 / 住宅 / 数据快捷维护页面
  RES_DATA_QUICK: '/property/res/base-info/quick',
  // 楼盘评级
  RES_RATING: '/property/res/base-info/res-rating',
  // 楼盘评级
  RES_RATING_HISTORY: '/property/res/base-info/res-rating/history',
  // 房产数据 / 住宅 / 房号附属房屋
  RES_HOUSE_ATTACHED: '/property/res/base-info/house-attached',
  // 房产数据 / 住宅 / 样本案例列表
  RES_SAMPLE_CASEINFO: '/property/res/sample-case-info',
  // 房产数据 / 住宅 / 样本案例列表 / 新增 or 编辑
  RES_SAMPLE_CASEINFO_EDIT: '/property/res/sample-case-info/edit',
  // 房产数据 / 住宅 / 基础楼盘列表
  RES_SAMPLE_CASEHOUSE: '/property/res/sample-case-house',
  // 房产数据 / 住宅 / 基础楼盘列表 / 新增
  RES_SAMPLE_CASEHOUSE_EDIT: '/property/res/sample-case-house/edit',
  // 房产数据 / 住宅 / 样本楼盘列表
  RES_QUANITY_OF_SAMPLE_BUILDINGS: '/property/res/sample-case-house/buildings',
  // 房产数据 / 住宅 / 租金案例列表
  RES_RENT_CASEINFO: '/property/res/rent-case-info',
  // 房产数据 / 住宅 / 租金案例列表 / 新增 or 编辑
  RES_RENT_CASEINFO_EDIT: '/property/res/rent-case-info/edit',
  
  // 房产数据 / 住宅 / 住宅法拍案例
  RES_CASE_LOSURE:'/property/res/losure-case-info',
  RES_CASE_LOSURE_ADD:'/property/res/losure-case-info/edit',
  // 房产数据 / 住宅 / 法拍案例数据 /导入
  RES_LOSURE_CASEINFO_IMPORT: '/property/res/losure-case-info/import',
  RES_CASE_LOSURE_ERROR: '/property/res/losure-case-info/import/error',
  
    
    // 房产数据 / 住宅 / 相关楼盘名称
  RES_PRO_NAME: '/property/res/pro-name',
  // 房产数据 / 住宅 / 相关楼盘地址
  RES_PRO_ADDR: '/property/res/pro-addr',
  // 房产数据 / 住宅 / 房号列表
  RES_HOUSE_NUM: '/property/res/base-info/house-num',
  // 房产数据 / 住宅 / 房号列表 / 新增
  RES_HOUSE_NUM_EDIT: '/property/res/base-info/house-num/edit',
  // 房产数据 / 住宅 / 基础数据 /导入
  RES_BASEINFO_IMPORT: '/property/res/base-info/import',
  // 房产数据 / 住宅 / 案例数据 /导入
  RES_CASEINFO_IMPORT: '/property/res/case-info/import',
  // 房产数据 / 住宅 / 相关楼盘名称 /导入
  RES_PRONAME_IMPORT: '/property/res/pro-name/import',
  // 房产数据 / 住宅 / 相关楼盘地址 /导入
  RES_PROADDR_IMPORT: '/property/res/pro-addr/import',
  // 房产数据 / 住宅 / 楼盘价格 /导入
  RES_PROAVG_IMPORT: '/property/res/project-avg/import',
  // 房产数据 / 住宅 / 楼盘租金 /导入
  RES_PRORENT_IMPORT: '/property/res/project-rent/import',
  // 房产数据 / 住宅 / 样本案例列表 /导入
  RES_SAMPLE_CASEINFO_IMPORT: '/property/res/sample-case-info/import',
  // 房产数据 / 住宅 / 住宅样本楼盘 /导入
  RES_SAMPLE_CASEHOUSE_IMPORT: '/property/res/sample-case-house/import',
  // 房产数据 / 住宅 / 租金案例列表 /导入
  RES_RENT_CASEINFO_IMPORT: '/property/res/rent-case-info/import',
  // 房产数据 / 长租公寓 / 案例数据 / 导入
  RES_APART_CASE_INFO_IMPORT: '/property/apartment/case-info/import',
  // 房产数据 / 公共配套 / 导入
  RES_PUBLIC_RESOURCE_IMPORT: '/property/res/public-resource/import',

  // 房产数据 / 住宅 / 自定义导出
  RES_PRO_EXPORT: '/property/res/base-info/export',

  // S 楼盘均价
  // 房产数据 / 住宅 / 楼盘均价
  RES_PRO_PROJECT_AVG: '/property/res/project-avg',
  //  房产数据 / 住宅 / 楼盘价格 / 基准房价详情
  RES_PRO_HOUSE_PRICE_DETAIL: '/property/res/project-avg/house-price-detail',
  //  房产数据 / 住宅 / 楼盘价格 / 案例均价详情
  RES_PRO_CASE_PRICE_DETAIL: '/property/res/project-avg/case-price-detail',
  //  房产数据 / 住宅 / 楼盘价格 / 基准房价历史数据
  RES_PRO_BASE_PRICE_HISTORY: '/property/res/project-avg/base-price-history',
  //  房产数据 / 住宅 / 楼盘价格 / 案例均价历史数据
  RES_PRO_CASE_PRICE_HISTORY: '/property/res/project-avg/case-price-history',
  //  房产数据 / 住宅 / 楼盘价格 / 案例均价历史数据 新增
  RES_PRO_CASE_PRICE_HISTORY_ADD:
    '/property/res/project-avg/ase-price-history/case-add',
  //  房产数据 / 住宅 / 楼盘价格 / 基准房价历史数据 新增
  RES_PRO_BASE_PRICE_HISTORY_ADD:
    '/property/res/project-avg/ase-price-history/base-add',
  // 房产数据 / 住宅 / 楼盘均价 / 楼盘名称错误条数
  RES_PROJECTAVG_ERROR: '/property/res/project-avg/import/error',
  // E 楼盘均价

  // S 楼盘租金
  // 房产数据 / 住宅 / 楼盘租金租售比添加
  RES_PRORENT_RENTAL_ADD: '/property/res/project-rent/rental-ratio/add',
  // 房产数据 / 住宅 / 楼盘租金租售比编辑
  RES_PRORENT_RENTAL_DETAIL: '/property/res/project-rent/rental-ratio/detail',
  // 房产数据 / 住宅 / 楼盘租金租售比历史
  RES_PRORENT_RENTAL_HISTORY: '/property/res/project-rent/rental-ratio/history',
  // 房产数据 / 住宅 / 楼盘租金租售比
  RES_PRORENT_RENTAL: '/property/res/project-rent/rental-ratio',
  // 房产数据 / 住宅 / 楼盘租金

  RES_PRO_PROJECT_RENT: '/property/res/project-rent',
  //  房产数据 / 住宅 / 楼盘租金 / 基准房价详情
  RES_PRO_HOUSE_RENT_DETAIL: '/property/res/project-rent/house-rent-detail',
  //  房产数据 / 住宅 / 楼盘租金 / 案例租金详情
  RES_PRO_CASE_RENT_DETAIL: '/property/res/project-rent/case-rent-detail',
  //  房产数据 / 住宅 / 楼盘租金 / 基准房价历史数据
  RES_PRO_BASE_RENT_HISTORY: '/property/res/project-rent/base-rent-history',
  //  房产数据 / 住宅 / 楼盘租金 / 案例租金历史数据
  RES_PRO_CASE_RENT_HISTORY: '/property/res/project-rent/case-rent-history',
  //  房产数据 / 住宅 / 楼盘租金 / 案例租金历史数据 新增
  RES_PRO_CASE_RENT_HISTORY_ADD:
    '/property/res/project-rent/ase-rent-history/case-add',
  //  房产数据 / 住宅 / 楼盘租金 / 基准房价历史数据 新增
  RES_PRO_BASE_RENT_HISTORY_ADD:
    '/property/res/project-rent/ase-rent-history/base-add',
  // E 楼盘租金

  //  房产数据 / 住宅 / 楼盘价格 / 只看评估案例均价 详情
  RES_PRO_ESTIMATE_CASE_DETAIL:
    '/property/res/project-avg/estimate-case-detail',
  //  房产数据 / 住宅 / 楼盘价格 / 只看评估案例均价 新增
  RES_PRO_ESTIMATE_CASE_ADD: '/property/res/project-avg/estimate-case-add',
  //  房产数据 / 住宅 / 楼盘价格 / 只看评估案例均价 历史数据
  RES_PRO_ESTIMATE_CASE_HISTORY:
    '/property/res/project-avg/estimate-case-history',

  //  房产数据 / 住宅 / 楼盘价格 / 只看评估基准价 详情
  RES_PRO_ESTIMATE_BASE_DETAIL:
    '/property/res/project-avg/estimate-base-detail',
  //  房产数据 / 住宅 / 楼盘价格 / 只看评估基准价 新增
  RES_PRO_ESTIMATE_BASE_ADD: '/property/res/project-avg/estimate-base-add',
  //  房产数据 / 住宅 / 楼盘价格 / 只看评估基准价 历史数据
  RES_PRO_ESTIMATE_BASE_HISTORY:
    '/property/res/project-avg/estimate-base-history',

  //  房产数据 / 住宅 / 楼盘价格 / 只看标准房价格 详情
  RES_PRO_STANDARD_PRICE_DETAIL:
    '/property/res/project-avg/standard-price-detail',
  //  房产数据 / 住宅 / 楼盘价格 / 只看标准房价格 新增
  RES_PRO_STANDARD_PRICE_ADD: '/property/res/project-avg/standard-price-add',
  //  房产数据 / 住宅 / 楼盘价格 / 只看标准房价格 历史数据
  RES_PRO_STANDARD_PRICE_HISTORY:
    '/property/res/project-avg/standard-price-history',

  //  房产数据 / 住宅 / 楼盘价格 / 价格比值
  RES_PRO_PRICE_RATE: '/property/res/project-avg/price-rate',
  //  房产数据 / 住宅 / 楼盘价格 / 价格比值 详情
  RES_PRO_PRICE_RATE_DETAIL: '/property/res/project-avg/price-rate/detail',
  //  房产数据 / 住宅 / 楼盘价格 / 地图核价
  RES_PRO_PRICE_MAP_VALUATION: '/property/res/project-avg/map-valuation',


  // 房产数据 / 公共配套
  RES_PUBLIC_RESOURCE: '/property/res/public-resource',
  RES_PUBLIC_RESOURCE_EDIT: '/property/res/public-resource/add',

  // 房产数据 / 长租公寓 / 案例数据
  RES_APART_CASE_INFO: '/property/apartment/case-info',
  RES_APART_CASE_INFO_EDIT: '/property/apartment/case-info/add',

  // 房产数据 / 导出任务
  RES_EXPORT_TASK: '/property/export-taskhd',


  
  // 数据统计 模块
  DATA: '/data',
  DATA_CITY_PVG_IMPORT: '/data/city-pvg/import',
  DATA_CITY_PVG: '/data/city-pvg',
  // 数据统计 / 导出任务
  DATA_EXPORT_TASK: '/data/export-taskds',

  // 数据统计-区域租售比
  DATA_AREA_RENTAL_IMPORT: '/data/area-rental/import',
  DATA_AREA_RENTAL: '/data/area-rental',
  DATA_AREA_RENTAL_DETAIL: '/data/area-rental/detail',
  DATA_AREA_RENTAL_HISTORY: '/data/area-rental/history',

  // 数据统计-楼盘评级规则
  DATA_ESTATE_RATING_IMPORT: '/data/estate-rating/import',
  DATA_ESTATE_RATING: '/data/estate-rating',
  
  // 价格预警统计
  DATA_WARNING_STATISTICS: '/data/warning-statistics',
  
  // 成交数据统计
  DATA_DEAL_STATISTICS: '/data/deal-statistics',
  
  // 法拍数据统计
  DATA_LOSURE_STATISTICS: '/data/losure-statistics',
  
  
  // 数据审核 模块
  CHECK: '/check',
  // 数据审核 / 反馈中心 /楼盘
  FEEDBACK_PROPERTYS: '/check/feedback/house',
  // 数据审核 / 反馈中心 /楼盘回复
  FEEDBACK_PROPERTYS_REPLY: '/check/feedback/house/reply',
  // 数据审核 / 反馈中心 /楼盘均价
  FEEDBACK_PROPERTY_PVG: '/check/feedback/house-pvg',
  // 数据审核 / 反馈中心 /楼盘均价回复
  FEEDBACK_PROPERTY_PVG_REPLY: '/check/feedback/house-pvg/reply',
  // DC模块
  // 数据审核 / DC /楼盘
  AUDIT_FLOOR: '/check/audit/floor',
  AUDIT_FLOOR_EDIT: '/check/audit/floor/edit',
  // 数据审核 / DC /楼栋
  AUDIT_BUILDING: '/check/audit/building',
  AUDIT_BUILDING_EDIT: '/check/audit/building/edit',
  // 数据审核 / DC /房号
  AUDIT_NUMBER: '/check/audit/number',
  AUDIT_NUMBER_EDIT: '/check/audit/number/edit',

  
  
  // 后台配置
  BACKCONFIG: '/backConfig',
  // 后台配置 / 数据来源管理
  BACKCONFIG_DATA_SOURCE_MANAGE: '/backConfig/datasourceManage',
  // 权限管理
  AUTHORITY: '/authority',
  // 权限管理 / 角色管理
  AUTHORITY_ROLE_MANAGE: '/authority/center/roleManage',
  // 权限管理 / 角色管理 / 设置权限
  AUTHORITY_ROLE_MANAGE_SET: '/authority/center/roleManage/set',
  // 权限管理 / 账号管理
  AUTHORITY_ACCOUNT_MANAGE: '/authority/center/accountManage',

  // 房产数据 / 住宅 / 基础数据 /导入
  BUS_BUSINFO_IMPORT: '/property/bus/bus-info/import',
  // 房产数据 / 商业 / 基础数据
  BUS_BUSINFO: '/property/bus/bus-info',
}
