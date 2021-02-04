import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import router from 'client/router'
import { pagePermission } from 'client/utils'
// 公共导入模块
import CommonImport from 'client/modules/common/import'
// 公共导出任务模块
import CommonExportTask from 'client/modules/common/exportTask'

// 住宅基础数据模块
import { BaseInfo, BaseInfoAdd, BuildRatio, AreaDraw } from './baseInfo'
// 住宅案例数据模块
import { CaseInfo, CaseInfoEdit, CaseInfoError } from './caseInfo'
// 住宅样本案例数据
import { CaseInfoSample, CaseInfoSampleEdit } from './caseInfo-sample'
// 住宅样本楼盘模块
import { CaseHouseSample, CaseHouseSampleBuildings } from './caseHouse-simple'
// 住在租金案例数据
import { CaseInfoRent, CaseInfoRentEdit } from './caseInfo-rent'

// 住宅法拍案例
import { CaseLosure, CaseLosureInfoEdit } from './caseLosure'
// 相关楼盘名称模块
import ProName from './proName'
// 相关楼盘地址模块
import ProAddr from './proAddr'
// 楼栋数据模块
import { BuildInfo, BuildInfoAdd } from './buildInfo'
// 城市标准差模块
import HouseStand from './houseStand'
import HouseStandThree from './HouseStandThree'
//数据快捷维护页
import DataQuick from './dataQuick'
// 租金城市标准差v3.0
import RentHouseStandThree from './rentHouseStandThree'
// 楼盘评级
import { ResRating, ResRatingHistory } from './resRating'

import LngLat from './LngLat'
import { ProjectSet, ProjectSetDetail } from './ProjectSet'
// 附属房屋 wy
import HouseAttached from './houseAttached'
// 房号数据模块
import { HouseNum, HouseNameEdit } from './houseNum'
// 楼盘价格模块
import {
  MapValuation,
  ProjectAvg,
  BasePriceDetail,
  CasePriceDetail,
  EstimateCaseDetail,
  EstimateBaseDetail,
  StandardPriceDetail,
  BasePriceHistory,
  CasePriceHistory,
  EstimateCaseHistory,
  EstimateBaseHistory,
  StandardPriceHistory,
  CasePriceAdd,
  BasePriceAdd,
  ProjectAvgError,
  EstimateCaseAdd,
  EstimateBaseAdd,
  StandardPriceAdd,
} from './projectAvg'
// 楼盘租金模块
import {
  ProjectRent,
  BaseRentDetail,
  CaseRentDetail,
  BaseRentHistory,
  CaseRentHistory,
  CaseRentAdd,
  BaseRentAdd,
  projectRentRatio,
  projectRentRatioHistory,
  projectRentRatioAdd,
  projectRentRatioDetail
} from './projectRent'
// 楼盘/楼栋 图片模块
import ProImage from './proImage'
// 公共导入模块
// import HouseImport from './import'
// 公共导出任务模块
// import ExportTask from './exportTask'
// 自定义导出模块
import SelfDefinedExport from './export'
// 长租公寓模块
import { CaseInfoApart, CaseInfoApartEdit } from './caseInfo-apart'
// 公共配套
import { PublicResource, PublicResourceEdit } from './public-resource'
// 楼盘配套
import { ProjectResource, ProjectResourceEdit } from './project-resource'
// 楼盘价格-价格比值
import { PriceRate, PriceRateDetail } from './priceRate'

// 商业模块
// 商业基础数据模块
import { BusInfo } from './busIness'

/**
 *  房产数据 模块路由
 */
class PropertyRoutes extends Component {
  render() {
    return (
      <Switch>
        {/* 住宅基础数据 */}
        {pagePermission('fdc:hd:residence:base') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_BASEINFO} />}
          />
        ) : (
          ''
        )}

        {/* 住宅案例数据 */}
        {pagePermission('fdc:hd:residence:case') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_CASEINFO} />}
          />
        ) : (
          ''
        )}

        {/* 住宅样本案例 */}
        {pagePermission('fdc:hd:residence:sampleCase') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_SAMPLE_CASEINFO} />}
          />
        ) : (
          ''
        )}
        {/* 住宅样本楼盘 */}
        {pagePermission('fdc:hd:residence:sampleSale') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_SAMPLE_CASEHOUSE} />}
          />
        ) : (
          ''
        )}
        {/* 住宅租金案例 */}
        {pagePermission('fdc:hd:residence:rental') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_RENT_CASEINFO} />}
          />
        ) : (
          ''
        )}
        {/* 相关楼盘名称 */}
        {pagePermission('fdc:hd:residence:saleName') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_PRO_NAME} />}
          />
        ) : (
          ''
        )}
        {/* 住宅法拍案例 */}
        {pagePermission('fdc:hd:residence:saleAddress') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_CASE_HOUSING} />}
          />
        ) : (
          ''
        )}
        {/* 相关楼盘地址 */}
        {pagePermission('fdc:hd:residence:saleAddress') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_PRO_ADDR} />}
          />
        ) : (
          ''
        )}
        {/* 楼盘价格 */}
        {pagePermission('fdc:hd:residence:average') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_PRO_PROJECT_AVG} />}
          />
        ) : (
          ''
        )}
        {/* 公共配套 */}
        {pagePermission('fdc:hd:residence:commonMatch') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_PUBLIC_RESOURCE} />}
          />
        ) : (
          ''
        )}
        {/* 案例数据 */}
        {pagePermission('fdc:hd:longRental:caseData') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_APART_CASE_INFO} />}
          />
        ) : (
          ''
        )}
        {/* 导出任务 */}
        {pagePermission('fdc:hd:export') ? (
          <Route
            path={router.PROPERTY}
            exact
            render={() => <Redirect to={router.RES_EXPORT_TASK} />}
          />
        ) : (
          ''
        )}

        <Route path={router.RES_BASEINFO_IMPORT} component={CommonImport} />
        {/* 楼盘配套 */}
        <Route
          path={router.RES_PROJECT_RESOURCE_EDIT}
          component={ProjectResourceEdit}
        />
        <Route path={router.RES_PROJECT_RESOURCE} component={ProjectResource} />
        {/* 住宅基础数据模块 */}
        <Route path={router.RES_PRO_EXPORT} component={SelfDefinedExport} />
        <Route path={router.RES_PRO_IMAGE} component={ProImage} />
        <Route path={router.RES_HOUSE_STAND} component={HouseStand} />
        <Route path={router.RES_DATA_QUICK} component={DataQuick} />
          <Route
          path={router.RES_HOUSE_STAND_THREE}
          component={HouseStandThree}
        />
        {/* 租金城市标准差 */}
        <Route
          path={router.RENT_HOUSE_STAND_THREE}
          component={RentHouseStandThree}
        />
        {/* 楼盘评级 */}
        <Route path={router.RES_RATING_HISTORY} component={ResRatingHistory} />
        <Route path={router.RES_RATING} component={ResRating} />

        {/* 附属房屋 wy */}
        <Route path={router.RES_HOUSE_ATTACHED} component={HouseAttached} />

        <Route path={router.RES_HOUSE_NUM_EDIT} component={HouseNameEdit} />
        <Route path={router.RES_HOUSE_NUM} component={HouseNum} />
        <Route path={router.RES_BUILD_INFO_ADD} component={BuildInfoAdd} />
        <Route path={router.RES_BUILD_INFO} component={BuildInfo} />
        <Route path={router.RES_BASEINFO_ADD} component={BaseInfoAdd} />
        <Route path={router.RES_BUILD_RATIO} component={BuildRatio} />
        <Route path={router.RES_AREA_DRAW_LNGLAT} component={LngLat} />
        <Route path={router.RES_AREA_DRAW} component={AreaDraw} />
        <Route
          path={router.RES_PROJECT_SET_DETAIL}
          component={ProjectSetDetail}
        />
        <Route path={router.RES_PROJECT_SET} component={ProjectSet} />
        <Route path={router.RES_BASEINFO} component={BaseInfo} />
        {/* 住宅案例数据模块 */}
        <Route path={router.RES_CASEINFO_ERROR} component={CaseInfoError} />
        <Route path={router.RES_CASEINFO_IMPORT} component={CommonImport} />
        <Route path={router.RES_CASEINFO_EDIT} component={CaseInfoEdit} />
        <Route path={router.RES_CASEINFO} component={CaseInfo} />
        {/* 住宅-样本案例数据模块 */}
        <Route
          path={router.RES_SAMPLE_CASEINFO_IMPORT}
          component={CommonImport}
        />
        <Route
          path={router.RES_SAMPLE_CASEINFO_EDIT}
          component={CaseInfoSampleEdit}
        />
        <Route path={router.RES_SAMPLE_CASEINFO} component={CaseInfoSample} />
        {/* 住宅-住宅样本楼盘模块 */}
        <Route
          path={router.RES_QUANITY_OF_SAMPLE_BUILDINGS}
          component={CaseHouseSampleBuildings}
        />
        <Route
          path={router.RES_SAMPLE_CASEHOUSE_IMPORT}
          component={CommonImport}
        />
        <Route path={router.RES_SAMPLE_CASEHOUSE} component={CaseHouseSample} />
        {/* 住宅-租金案例数据模块 */}
        <Route
          path={router.RES_RENT_CASEINFO_IMPORT}
          component={CommonImport}
        />
        <Route
          path={router.RES_RENT_CASEINFO_EDIT}
          component={CaseInfoRentEdit}
        />
        <Route path={router.RES_RENT_CASEINFO} component={CaseInfoRent} />
        {/* 相关楼盘名称模块 */}
        <Route path={router.RES_PRONAME_IMPORT} component={CommonImport} />
        <Route path={router.RES_PRO_NAME} component={ProName} />
        {/*住宅法拍案例*/}
        <Route path={router.RES_CASE_LOSURE_ERROR} component={CaseInfoError} />
        <Route path={router.RES_LOSURE_CASEINFO_IMPORT} component={CommonImport} />
        <Route path={router.RES_CASE_LOSURE_ADD} component={CaseLosureInfoEdit} />
        <Route path={router.RES_CASE_LOSURE} component={CaseLosure} />
    
        {/* 相关楼盘地址模块 */}
        <Route path={router.RES_PROADDR_IMPORT} component={CommonImport} />
        <Route path={router.RES_PRO_ADDR} component={ProAddr} />

        {/* 楼盘均价模块 */}
        <Route path={router.RES_PROJECTAVG_ERROR} component={ProjectAvgError} />

        {/* 楼盘价格模块 */}
    
        <Route path={router.RES_PRO_PRICE_MAP_VALUATION} component={MapValuation} />
        
        <Route path={router.RES_PROAVG_IMPORT} component={CommonImport} />

        <Route
          path={router.RES_PRO_PRICE_RATE_DETAIL}
          component={PriceRateDetail}
        />
        <Route path={router.RES_PRO_PRICE_RATE} component={PriceRate} />

        <Route
          path={router.RES_PRO_CASE_PRICE_HISTORY_ADD}
          component={CasePriceAdd}
        />
        <Route
          path={router.RES_PRO_BASE_PRICE_HISTORY_ADD}
          component={BasePriceAdd}
        />
        <Route
          path={router.RES_PRO_ESTIMATE_CASE_ADD}
          component={EstimateCaseAdd}
        />
        <Route
          path={router.RES_PRO_ESTIMATE_BASE_ADD}
          component={EstimateBaseAdd}
        />
        <Route
          path={router.RES_PRO_STANDARD_PRICE_ADD}
          component={StandardPriceAdd}
        />
        <Route
          path={router.RES_PRO_CASE_PRICE_HISTORY}
          component={CasePriceHistory}
        />
        <Route
          path={router.RES_PRO_BASE_PRICE_HISTORY}
          component={BasePriceHistory}
        />
        <Route
          path={router.RES_PRO_ESTIMATE_CASE_HISTORY}
          component={EstimateCaseHistory}
        />
        <Route
          path={router.RES_PRO_ESTIMATE_BASE_HISTORY}
          component={EstimateBaseHistory}
        />
        <Route
          path={router.RES_PRO_STANDARD_PRICE_HISTORY}
          component={StandardPriceHistory}
        />
        <Route
          path={router.RES_PRO_HOUSE_PRICE_DETAIL}
          component={BasePriceDetail}
        />
        <Route
          path={router.RES_PRO_CASE_PRICE_DETAIL}
          component={CasePriceDetail}
        />
        <Route
          path={router.RES_PRO_ESTIMATE_CASE_DETAIL}
          component={EstimateCaseDetail}
        />
        <Route
          path={router.RES_PRO_ESTIMATE_BASE_DETAIL}
          component={EstimateBaseDetail}
        />
        <Route
          path={router.RES_PRO_STANDARD_PRICE_DETAIL}
          component={StandardPriceDetail}
        />
        <Route path={router.RES_PRO_PROJECT_AVG} component={ProjectAvg} />
        {/* 楼盘租金模块 */}
        <Route path={router.RES_PRORENT_IMPORT} component={CommonImport} />

        <Route
          path={router.RES_PRORENT_RENTAL_ADD}
          component={projectRentRatioAdd}
        />
        <Route
          path={router.RES_PRORENT_RENTAL_DETAIL}
          component={projectRentRatioDetail}
        />
        <Route
          path={router.RES_PRORENT_RENTAL_HISTORY}
          component={projectRentRatioHistory}
        />
        <Route path={router.RES_PRORENT_RENTAL} component={projectRentRatio} />
        <Route
          path={router.RES_PRO_CASE_RENT_HISTORY_ADD}
          component={CaseRentAdd}
        />
        <Route
          path={router.RES_PRO_BASE_RENT_HISTORY_ADD}
          component={BaseRentAdd}
        />
        <Route
          path={router.RES_PRO_CASE_RENT_HISTORY}
          component={CaseRentHistory}
        />
        <Route
          path={router.RES_PRO_BASE_RENT_HISTORY}
          component={BaseRentHistory}
        />
        <Route
          path={router.RES_PRO_HOUSE_RENT_DETAIL}
          component={BaseRentDetail}
        />
        <Route
          path={router.RES_PRO_CASE_RENT_DETAIL}
          component={CaseRentDetail}
        />
        <Route path={router.RES_PRO_PROJECT_RENT} component={ProjectRent} />
        {/* 长租公寓-案例数据 */}
        <Route
          path={router.RES_APART_CASE_INFO_IMPORT}
          component={CommonImport}
        />
        <Route
          path={router.RES_APART_CASE_INFO_EDIT}
          component={CaseInfoApartEdit}
        />
        <Route path={router.RES_APART_CASE_INFO} component={CaseInfoApart} />
        {/* 房产数据-导出任务 */}
        <Route path={router.RES_EXPORT_TASK} component={CommonExportTask} />
        {/* 公共配套 */}
        <Route
          path={router.RES_PUBLIC_RESOURCE_IMPORT}
          component={CommonImport}
        />
        <Route
          path={router.RES_PUBLIC_RESOURCE_EDIT}
          component={PublicResourceEdit}
        />
        <Route path={router.RES_PUBLIC_RESOURCE} component={PublicResource} />

        {/* 商业基础数据模块 */}
        <Route path={router.BUS_BUSINFO_IMPORT} component={CommonImport} />
        <Route path={router.BUS_BUSINFO} component={BusInfo} />
      </Switch>
    )
  }
}

export default PropertyRoutes
