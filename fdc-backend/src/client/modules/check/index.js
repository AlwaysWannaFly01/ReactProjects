import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import router from 'client/router'
import { pagePermission } from 'client/utils'
// 反馈中心楼盘模块
import { Propertys, PropertysReply } from './feedback/propertys'
// 反馈中心楼盘均价模块
import { PropertyPvg, PropertysPvgReply } from './feedback/propertyPvg'
// 反馈中心DC楼盘模块
import { AuditFloor, AuditFloorEdit } from './audit/auditFloor'
// 反馈中心DC楼栋模块
import { AuditBuilding, AuditBuildingEdit } from './audit/auditBuilding'
// 反馈中心DC房号模块
import { RoomNumber, RoomNumberEdit } from './audit/roomNumber'

class CheckRoutes extends Component {
  render() {
    return (
      <Switch>
        {/* 楼盘 */}
        {pagePermission('fdc:dc:feedbackCenter:sale') ? (
          <Route
            path={router.CHECK}
            exact
            render={() => <Redirect to={router.FEEDBACK_PROPERTYS} />}
          />
        ) : (
          ''
        )}

        {/* 楼盘均价 */}
        {pagePermission('fdc:dc:feedbackCenter:saleAvgPrice') ? (
          <Route
            path={router.CHECK}
            exact
            render={() => <Redirect to={router.FEEDBACK_PROPERTY_PVG} />}
          />
        ) : (
          ''
        )}

        {/* 数据审核-反馈中心-楼盘回复 */}
        <Route
          path={router.FEEDBACK_PROPERTYS_REPLY}
          component={PropertysReply}
        />
        {/* 数据审核-反馈中心-楼盘均价回复 */}
        <Route
          path={router.FEEDBACK_PROPERTY_PVG_REPLY}
          component={PropertysPvgReply}
        />
        {/* 数据审核-反馈中心-楼盘 */}
        <Route path={router.FEEDBACK_PROPERTYS} component={Propertys} />
        {/* 数据审核 - 反馈中心 - 楼盘均价 */}
        <Route path={router.FEEDBACK_PROPERTY_PVG} component={PropertyPvg} />
        {/* 数据审核 - DC - 楼盘 */}
        <Route path={router.AUDIT_FLOOR_EDIT} component={AuditFloorEdit} />
        <Route path={router.AUDIT_FLOOR} component={AuditFloor} />

        {/* 数据审核 - DC - 楼栋 */}
        <Route
          path={router.AUDIT_BUILDING_EDIT}
          component={AuditBuildingEdit}
        />
        <Route path={router.AUDIT_BUILDING} component={AuditBuilding} />

        {/* 数据审核 - DC - 房号 */}
        <Route path={router.AUDIT_NUMBER_EDIT} component={RoomNumberEdit} />
        <Route path={router.AUDIT_NUMBER} component={RoomNumber} />
      </Switch>
    )
  }
}

export default CheckRoutes
