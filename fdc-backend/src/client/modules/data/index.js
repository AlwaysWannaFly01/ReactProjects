import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import router from 'client/router'
// 公共导出任务模块
import CommonExportTask from 'client/modules/common/exportTaskds'
import CommonImport from 'client/modules/common/import'

// import BaseInfo from './baseInfo'
import { CityPvg } from './cityPvg'
import { AreaRental, AreaRentalDetail, AreaRentalHistory } from './areaRental'
import { EstateRating } from './estateRating'
import { warningStatistics } from './warningStatistics'
import { dealStatistics } from './dealStatistics'
import { losureStatistics } from './losureStatistics'

class DataRoutes extends Component {
  render() {
    return (
      <Switch>
        {/* 城市均价 */}
        {pagePermission('fdc:ds:cityAvg') ? (
          <Route
            path={router.DATA}
            exact
            render={() => <Redirect to={router.DATA_CITY_PVG} />}
          />
        ) : (
          ''
        )}

        {/* 区域租售比 */}
        {pagePermission('fdc:ds:regionalRental') ? (
          <Route
            path={router.DATA}
            exact
            render={() => <Redirect to={router.DATA_AREA_RENTAL} />}
          />
        ) : (
          ''
        )}

        {/* 楼盘评级规则 */}
        {pagePermission('fdc:ds:ratingRules') ? (
          <Route
            path={router.DATA}
            exact
            render={() => <Redirect to={router.DATA_ESTATE_RATING} />}
          />
        ) : (
          ''
        )}

        {/* 导出任务 */}
        {pagePermission('fdc:ds:export') ? (
          <Route
            path={router.DATA}
            exact
            render={() => <Redirect to={router.DATA_EXPORT_TASK} />}
          />
        ) : (
          ''
        )}

        {/* 数据统计-导出任务 */}
        <Route path={router.DATA_EXPORT_TASK} component={CommonExportTask} />
        {/* 数据统计-城市均价-导入 */}
        <Route path={router.DATA_CITY_PVG_IMPORT} component={CommonImport} />
        {/* 数据统计-城市均价 */}
        <Route path={router.DATA_CITY_PVG} component={CityPvg} />

        {/* 数据统计-区域租售比-导入 */}
        <Route path={router.DATA_AREA_RENTAL_IMPORT} component={CommonImport} />
        {/* 数据统计-区域租售比历史 */}
        <Route
          path={router.DATA_AREA_RENTAL_HISTORY}
          component={AreaRentalHistory}
        />
        {/* 数据统计-区域租售比详情 */}
        <Route
          path={router.DATA_AREA_RENTAL_DETAIL}
          component={AreaRentalDetail}
        />
        {/* 数据统计-区域租售比 */}
        <Route path={router.DATA_AREA_RENTAL} component={AreaRental} />

        {/* 数据统计-楼盘评级规则 */}
        <Route
          path={router.DATA_ESTATE_RATING_IMPORT}
          component={CommonImport}
        />
        <Route path={router.DATA_ESTATE_RATING} component={EstateRating} />
        
        {/* 数据统计-价格预警统计 */}
        <Route path={router.DATA_WARNING_STATISTICS} component={warningStatistics} />
        
        {/* 数据统计-成交数据统计 */}
        <Route path={router.DATA_DEAL_STATISTICS} component={dealStatistics} />
        
        {/* 数据统计-法拍数据统计 */}
        <Route path={router.DATA_LOSURE_STATISTICS} component={losureStatistics} />
      </Switch>
    )
  }
}

export default DataRoutes
