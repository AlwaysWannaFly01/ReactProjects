import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { Link } from 'react-router-dom'
import { parse } from 'qs'
import { setSession, getSession, removeSession } from 'client/utils/assist'
import router from 'client/router'
import {
  Breadcrumb,
  Icon,
  Form,
  Row,
  Col,
  Button,
  Input,
  Table,
  Popover,
  Popconfirm,
  Message,
  Switch,
  Modal
} from 'antd'
import showTotal from 'client/utils/showTotal'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './AuditBuilding.less'
import { breadEditList, editColumns } from './constant'

/**
 * @description 数据审核-DC模块
 * @author WY
 */

class AuditBuildingEdit extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    getBuildDetail: PropTypes.func.isRequired,
    getfdcBuildList: PropTypes.func.isRequired,
    fdcBuildCheckCB: PropTypes.func.isRequired,
    buildDetail: PropTypes.object.isRequired,
    fdcBuildList: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    getAuthorityList: PropTypes.func.isRequired,
    authorityList: PropTypes.array.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    const search = parse(props.location.search.substr(1))
    this.state = {
      flag: 0, // 0为不展示 1为正式房号 2为转他人
      cityName: search.cityName,
      id: search.id,
      areaName: search.areaName,
      projectName: search.projectName,
      // buildingId: search.id,
      fdcProjectStatus: search.fdcProjectStatus,
      cityId: search.cityId,
      // projectId: search.fdcBuildingId,
      // fdcBuildingId: search.fdcBuildingId,
      fdcProjectId: search.fdcProjectId,
      // 处理状态
      processState: search.processState,
      flagShow: 'inline-block',
      flagHide: 'none',
      contentHeight: '380px',
      labelHeight: '255px'
    }
  }
  componentDidMount() {
    const { id } = this.state
    this.props.getBuildDetail(id)
    const { processState } = this.state
    if (processState === '2') {
      this.changeBuilding(1, null)
    }
    this.props.getAuthorityList({ cityId: this.state.cityId })
  }
  // 转楼栋处理 是否可点击
  componentWillUnmount() {
    if (getSession('buildState')) {
      removeSession('buildState')
    }
  }

  showModal = () => {
    this.setState({
      visible: true
    })
  }

  handleOk = (matchStatus, id, matchCurrent) => {
    this.changeStatus(matchStatus, id, matchCurrent)
    this.setState({
      visible: false
    })
  }

  handleCancel = () => {
    this.setState({
      visible: false
    })
  }

  infoDc() {
    Modal.warning({
      title: '该DC楼栋已关联了FDC的另一个楼栋'
    })
  }

  infoFdc() {
    Modal.warning({
      title: '该FDC楼栋已被DC的另一个楼栋关联了'
    })
  }

  changeStatus = (matchStatus, sid, matchCurrent) => {
    const { id } = this.state
    const params = {
      id,
      matchStatus: matchStatus ? 0 : 1,
      matchId: sid
    }
    this.props.fdcBuildCheckCB(
      '/buildingDcCheck/match',
      params,
      (code, message) => {
        if (code === '200') {
          this.changeBuilding(1, null)
          this.props.getBuildDetail(id)
          if (matchCurrent === 0) {
            Message.success('关联成功')
            this.setState({ processState: '2' }, () => {
              setSession('buildState', this.state.processState)
            })
          }
          if (matchCurrent === 1) {
            Message.success('取消关联成功')
            this.setState({ processState: '1' }, () => {
              setSession('buildState', this.state.processState)
            })
          }
        } else {
          Message.error(message)
        }
      }
    )
  }
  changeBuilding = (flag, url) => {
    const { cityId, fdcProjectId, id } = this.state
    this.setState({ flag })
    if (flag === 1) {
      const params = {
        pageNum: 1,
        pageSize: 20,
        cityId,
        fdcProjectId,
        buildingId: id
      }
      this.props.getfdcBuildList(params)
    } else if (flag === 5) {
      this.context.router.history.push({
        pathname: router.AUDIT_BUILDING
      })
    } else {
      // 自行判断
      this.props.fdcBuildCheckCB(url, { id }, (code, message) => {
        if (code === '200') {
          Message.success('操作成功')
          // eslint-disable-next-line
          const { areaId, projectId, keyword, cityValues, pageNum } = parse(
            sessionStorage.getItem('AUDIT_BUILDING_SEARCH')
          )
          const baseInfoSearch = `keyword=${keyword ||
            ''}&projectId=${projectId ||
            ''}&cityValues=${cityValues}&areaId=${areaId}&pageNum=${pageNum}`
          // 将DC楼盘列表查询条件设置到 sessionStorage
          sessionStorage.setItem('AUDIT_BUILDING_SEARCH', baseInfoSearch)
          this.context.router.history.push({
            pathname: router.AUDIT_BUILDING,
            search: baseInfoSearch
          })
        } else {
          Message.error(message)
        }
      })
    }
  }

  handleSearch = (e, pageNum) => {
    const { cityId, fdcProjectId, id } = this.state
    this.props.form.validateFields(['keyword'], (err, values) => {
      if (!err) {
        const params = {
          pageNum,
          pageSize: 20,
          cityId,
          fdcProjectId,
          keyword: values.keyword,
          buildingId: id
        }
        this.props.getfdcBuildList(params)
      }
    })
  }

  openHouse = () => {
    const { cityId, cityName, fdcProjectId } = this.state
    this.props.updateVisitCities({ cityId, cityName }, () => {
      window.open(
        `${
          router.RES_BUILD_INFO_ADD
        }?cityId=${cityId}&projectId=${fdcProjectId}`
      )
    })
  }

  show() {
    this.setState({
      flagShow: 'none',
      flagHide: 'inline-block',
      contentHeight: 'auto',
      labelHeight: 'auto'
    })
  }
  hide() {
    this.setState({
      flagShow: 'inline-block',
      flagHide: 'none',
      contentHeight: '380px',
      labelHeight: '255px'
    })
  }
  authorityModal() {
    Modal.error({
      title: '温馨提示：',
      content: '你没有该楼栋的城市权限，不允许下一步操作'
    })
  }

  renderBreads() {
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadEditList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? <Link to={item.path}>{item.name}</Link> : item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderForm() {
    const { buildDetail } = this.props
    const {
      processState,
      flagShow,
      flagHide,
      contentHeight,
      labelHeight // eslint-disable-line
    } = this.state
    // 楼盘名称
    const contentProjectName = (
      <div className={styles.contentPop}>{buildDetail.projectName}</div>
    )
    const showProjectName = !!(
      buildDetail.projectName && buildDetail.projectName.length > 12
    )
    // 楼栋名称
    const contentBuildingName = (
      <div className={styles.contentPop}>{buildDetail.buildingName}</div>
    )
    const showBuildingName = !!(
      buildDetail.buildingName && buildDetail.buildingName.length > 12
    )
    // 楼栋别名
    const contentBuildingAlias = (
      <div className={styles.contentPop}>{buildDetail.buildingAlias}</div>
    )
    const showBuildingAlias = !!(
      buildDetail.buildingAlias && buildDetail.buildingAlias.length > 12
    )
    // 销售许可证
    const contentForSaleLicence = (
      <div className={styles.contentPop}>{buildDetail.forSaleLicence}</div>
    )
    const showForSaleLicence = !!(
      buildDetail.forSaleLicence && buildDetail.forSaleLicence.length > 12
    )
    // 价格系数说明
    const contentPriceRateDesc = (
      <div className={styles.contentPop}>{buildDetail.priceRateDesc}</div>
    )
    const showPriceRateDesc = !!(
      buildDetail.priceRateDesc && buildDetail.priceRateDesc.length > 12
    )
    // 梯户比
    const contentElevatorHouseholdRate = (
      <div className={styles.contentPop}>
        {buildDetail.elevatorHouseholdRate}
      </div>
    )
    const showElevatorHouseholdRate = !!(
      buildDetail.elevatorHouseholdRate &&
      buildDetail.elevatorHouseholdRate.length > 12
    )
    // 门牌号（地址）
    const contentRoomAddress = (
      <div className={styles.contentPop}>{buildDetail.roomAddress}</div>
    )
    const showRoomAddress = !!(
      buildDetail.roomAddress && buildDetail.roomAddress.length > 12
    )
    // 楼层分布
    const contentFloorDistribution = (
      <div className={styles.contentPop}>{buildDetail.floorDistribution}</div>
    )
    const showFloorDistribution = !!(
      buildDetail.floorDistribution && buildDetail.floorDistribution.length > 12
    )
    // 地下室用途
    const contentUndergroundUsage = (
      <div className={styles.contentPop}>{buildDetail.undergroundUsage}</div>
    )
    const showUndergroundUsage = !!(
      buildDetail.undergroundUsage && buildDetail.undergroundUsage.length > 12
    )
    // 电梯品牌
    const contentElevatorBrand = (
      <div className={styles.contentPop}>{buildDetail.elevatorBrand}</div>
    )
    const showElevatorBrand = !!(
      buildDetail.elevatorBrand && buildDetail.elevatorBrand.length > 12
    )
    // 设备设施
    const contentFacility = (
      <div className={styles.contentPop}>{buildDetail.facility}</div>
    )
    const showFacility = !!(
      buildDetail.facility && buildDetail.facility.length > 12
    )
    // 楼栋预售名称
    const contentPreSaleName = (
      <div className={styles.contentPop}>{buildDetail.preSaleName}</div>
    )
    const showPreSaleName = !!(
      buildDetail.preSaleName && buildDetail.preSaleName.length > 12
    )
    // 地址
    const contentAddress = (
      <div className={styles.contentPop}>{buildDetail.address}</div>
    )
    const showAddress = !!(
      buildDetail.address && buildDetail.address.length > 12
    )
    // 备注
    const contentRemark = (
      <div className={styles.contentPop}>{buildDetail.remark}</div>
    )
    const showRemark = !!(buildDetail.remark && buildDetail.remark.length > 12)
    return (
      <div className={styles.contentShow}>
        <div className={styles.contentAll} style={{ height: contentHeight }}>
          <div>
            <span className={styles.titleStyle} />
            DC楼栋详细信息：
          </div>
          <div className={styles.labelAll} style={{ height: labelHeight }}>
            <Row>
              <Col span={12}>
                <span className={styles.labelRight}>数据建设机构：</span>
                <span>{buildDetail.companyName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>数据修改机构：</span>
                <span>{buildDetail.updateCompanyName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋创建账号：</span>
                <span>{buildDetail.creator}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋创建时间：</span>
                <span>
                  {buildDetail.crtTime ? buildDetail.crtTime.split('T', 1) : ''}
                </span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋修改账号：</span>
                <span>{buildDetail.modifier}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋修改时间：</span>
                <span>
                  {buildDetail.modTime ? buildDetail.modTime.split('T', 1) : ''}
                </span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>城市：</span>
                <span>{buildDetail.cityName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>行政区：</span>
                <span>{buildDetail.areaName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘名称：</span>
                {showProjectName ? (
                  <Popover content={contentProjectName} trigger="hover">
                    <span className={styles.limitAreaName}>
                      {buildDetail.projectName}
                    </span>
                  </Popover>
                ) : (
                  <span>{buildDetail.projectName}</span>
                )}
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋名称：</span>
                {showBuildingName ? (
                  <Popover content={contentBuildingName} trigger="hover">
                    <span className={styles.limitAreaName}>
                      {buildDetail.buildingName}
                    </span>
                  </Popover>
                ) : (
                  <span>{buildDetail.buildingName}</span>
                )}
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋ID：</span>
                <span>{buildDetail.id}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋别名：</span>
                {showBuildingAlias ? (
                  <Popover content={contentBuildingAlias} trigger="hover">
                    <span className={styles.limitAreaName}>
                      {buildDetail.buildingAlias}
                    </span>
                  </Popover>
                ) : (
                  <span>{buildDetail.buildingAlias}</span>
                )}
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>总层数：</span>
                <span>{buildDetail.totalFloorNum}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>建筑类型：</span>
                <span>{buildDetail.buildingType}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>建筑年代：</span>
                <span>
                  {buildDetail.buildDate
                    ? buildDetail.buildDate.split('T', 1)
                    : ''}
                </span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>价格系数：</span>
                <span>{buildDetail.priceRate}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>总户数：</span>
                <span>{buildDetail.totalHouseholdNum}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋用途：</span>
                <span>{buildDetail.usage}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>建筑结构：</span>
                <span>{buildDetail.structure}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>是否带电梯：</span>
                <span>{buildDetail.isWithElevator ? '是' : '否'}</span>
              </Col>
              {buildDetail.isFloorNumComfirmed ? (
                <Col span={12}>
                  <span className={styles.labelRight}>总层数是否被确认：</span>
                  <span>{buildDetail.isFloorNumComfirmed ? '是' : '否'}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.floorHeight ? (
                <Col span={12}>
                  <span className={styles.labelRight}>层高：</span>
                  <span>{buildDetail.floorHeight}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.forSaleLicence ? (
                <Col span={12}>
                  <span className={styles.labelRight}>销售许可证：</span>
                  {showForSaleLicence ? (
                    <Popover content={contentForSaleLicence} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.forSaleLicence}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.forSaleLicence}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.unitNum ? (
                <Col span={12}>
                  <span className={styles.labelRight}>单元数：</span>
                  <span>{buildDetail.unitNum}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.totalBuildingArea ? (
                <Col span={12}>
                  <span className={styles.labelRight}>建筑面积：</span>
                  <span>{buildDetail.totalBuildingArea}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.forSaleDate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>销售时间：</span>
                  <span>
                    {buildDetail.forSaleDate
                      ? buildDetail.forSaleDate.split('T', 1)
                      : ''}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.avgPrice ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋均价：</span>
                  <span>{buildDetail.avgPrice}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.avgPriceFloor ? (
                <Col span={12}>
                  <span className={styles.labelRight}>均价层：</span>
                  <span>{buildDetail.avgPriceFloor}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.onboardDate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>入伙时间：</span>
                  <span>
                    {buildDetail.onboardDate
                      ? buildDetail.onboardDate.split('T', 1)
                      : ''}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.isAbleEvaluated ? (
                <Col span={12}>
                  <span className={styles.labelRight}>是否可估：</span>
                  <span>{buildDetail.isAbleEvaluated ? '是' : '否'}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.forSaleAvgPrice ? (
                <Col span={12}>
                  <span className={styles.labelRight}>销售均价：</span>
                  <span>{buildDetail.forSaleAvgPrice}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.subHouseAvgPrice ? (
                <Col span={12}>
                  <span className={styles.labelRight}>附属房屋均价：</span>
                  <span>{buildDetail.subHouseAvgPrice}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.priceRateDesc ? (
                <Col span={12}>
                  <span className={styles.labelRight}>价格系数说明：</span>
                  {showPriceRateDesc ? (
                    <Popover content={contentPriceRateDesc} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.priceRateDesc}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.priceRateDesc}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.houseArea ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋户型面积：</span>
                  <span>{buildDetail.houseArea}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.houseAreaCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>
                    楼栋户型面积修正系数：
                  </span>
                  <span>{buildDetail.houseAreaCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.distance ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼间距：</span>
                  <span>{buildDetail.distance}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.distanceCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼间距系数：</span>
                  <span>{buildDetail.distanceCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.structureCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋结构修正系数：</span>
                  <span>{buildDetail.structureCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.buildingTypeCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>建筑类型修正系数：</span>
                  <span>{buildDetail.buildingTypeCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.annualCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>年期修正系数：</span>
                  <span>{buildDetail.annualCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.useageCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>用途修正系数：</span>
                  <span>{buildDetail.useageCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.location ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋位置：</span>
                  <span>{buildDetail.location}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.locationCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋位置修正系数：</span>
                  <span>{buildDetail.locationCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.sight ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋景观：</span>
                  <span>{buildDetail.sight}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.sightCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>景观修正系数：</span>
                  <span>{buildDetail.sightCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.orientation ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋朝向：</span>
                  <span>{buildDetail.orientation}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.orientationCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>朝向修正系数：</span>
                  <span>{buildDetail.orientationCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.elevatorHouseholdRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>梯户比：</span>
                  {showElevatorHouseholdRate ? (
                    <Popover
                      content={contentElevatorHouseholdRate}
                      trigger="hover"
                    >
                      <span className={styles.limitAreaName}>
                        {buildDetail.elevatorHouseholdRate}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.elevatorHouseholdRate}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.elevatorHouseholdRateCorrectedRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>梯户比修正系数：</span>
                  <span>{buildDetail.elevatorHouseholdRateCorrectedRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.isWithYard ? (
                <Col span={12}>
                  <span className={styles.labelRight}>是否带院子：</span>
                  <span>{buildDetail.isWithYard ? '是' : '否'}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.withYardRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>带院子修正系数：</span>
                  <span>{buildDetail.withYardRate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.roomAddress ? (
                <Col span={12}>
                  <span className={styles.labelRight}>门牌号（地址）：</span>
                  {showRoomAddress ? (
                    <Popover content={contentRoomAddress} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.roomAddress}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.roomAddress}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.floorDistribution ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼层分布：</span>
                  {showFloorDistribution ? (
                    <Popover content={contentFloorDistribution} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.floorDistribution}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.floorDistribution}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.undergroundFloorNum ? (
                <Col span={12}>
                  <span className={styles.labelRight}>地下室层数：</span>
                  <span>{buildDetail.undergroundFloorNum}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.undergroundArea ? (
                <Col span={12}>
                  <span className={styles.labelRight}>地下室总面积：</span>
                  <span>{buildDetail.undergroundArea}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.undergroundUsage ? (
                <Col span={12}>
                  <span className={styles.labelRight}>地下室用途：</span>
                  {showUndergroundUsage ? (
                    <Popover content={contentUndergroundUsage} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.undergroundUsage}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.undergroundUsage}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.singleFloorHouseholdNum ? (
                <Col span={12}>
                  <span className={styles.labelRight}>单层户数：</span>
                  <span>{buildDetail.singleFloorHouseholdNum}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.elevatorNum ? (
                <Col span={12}>
                  <span className={styles.labelRight}>电梯数量：</span>
                  <span>{buildDetail.elevatorNum}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.elevatorBrand ? (
                <Col span={12}>
                  <span className={styles.labelRight}>电梯品牌：</span>
                  {showElevatorBrand ? (
                    <Popover content={contentElevatorBrand} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.elevatorBrand}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.elevatorBrand}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.facility ? (
                <Col span={12}>
                  <span className={styles.labelRight}>设备设施：</span>
                  {showFacility ? (
                    <Popover content={contentFacility} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.facility}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.facility}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.longitude ? (
                <Col span={12}>
                  <span className={styles.labelRight}>经度：</span>
                  <span>{buildDetail.longitude}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.latitude ? (
                <Col span={12}>
                  <span className={styles.labelRight}>纬度：</span>
                  <span>{buildDetail.latitude}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.preSaleName ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋预售名称：</span>
                  {showPreSaleName ? (
                    <Popover content={contentPreSaleName} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.preSaleName}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.preSaleName}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.isDegreeRoom ? (
                <Col span={12}>
                  <span className={styles.labelRight}>是否带学位：</span>
                  <span>{buildDetail.isDegreeRoom ? '是' : '否'}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.isVirtual ? (
                <Col span={12}>
                  <span className={styles.labelRight}>是否虚拟楼栋：</span>
                  <span>{buildDetail.isVirtual ? '是' : '否'}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.address ? (
                <Col span={12}>
                  <span className={styles.labelRight}>地址：</span>
                  {showAddress ? (
                    <Popover content={contentAddress} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.address}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.address}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {buildDetail.externalWallDecorate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>外墙装修：</span>
                  <span>{buildDetail.externalWallDecorate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.ownershipType ? (
                <Col span={12}>
                  <span className={styles.labelRight}>产权形式：</span>
                  <span>{buildDetail.ownershipType}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.internalDecorate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>内部装修：</span>
                  <span>{buildDetail.internalDecorate}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.gas ? (
                <Col span={12}>
                  <span className={styles.labelRight}>管道燃气：</span>
                  <span>{buildDetail.gas}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.warm ? (
                <Col span={12}>
                  <span className={styles.labelRight}>采暖方式：</span>
                  <span>{buildDetail.warm}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.wallType ? (
                <Col span={12}>
                  <span className={styles.labelRight}>墙体类型：</span>
                  <span>{buildDetail.wallType}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.maintenance ? (
                <Col span={12}>
                  <span className={styles.labelRight}>维护情况：</span>
                  <span>{buildDetail.maintenance}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.objectType ? (
                <Col span={12}>
                  <span className={styles.labelRight}>物业类型：</span>
                  <span>{buildDetail.objectType}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.actualUsage ? (
                <Col span={12}>
                  <span className={styles.labelRight}>实际用途：</span>
                  <span>{buildDetail.actualUsage}</span>
                </Col>
              ) : (
                ''
              )}
              {buildDetail.remark ? (
                <Col span={12}>
                  <span className={styles.labelRight}>备注：</span>
                  {showRemark ? (
                    <Popover content={contentRemark} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {buildDetail.remark}
                      </span>
                    </Popover>
                  ) : (
                    <span>{buildDetail.remark}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
            </Row>
          </div>
          <div
            className={styles.buttonColor}
            style={{ display: flagShow }}
            onClick={() => this.show()}
          >
            <span>展开</span>
            <span>
              <Icon type="down" />
            </span>
          </div>
          <div
            className={styles.buttonColor}
            style={{ display: flagHide }}
            onClick={() => this.hide()}
          >
            <span>收起</span>
            <span>
              <Icon type="up" />
            </span>
          </div>
        </div>
        <div className={styles.contentButton}>
          <Row>
            <Col span={3}>
              <Button
                type="primary"
                onClick={() => this.changeBuilding(1, '/buildingDcCheck/match')}
              >
                楼栋关联
              </Button>
            </Col>
            <Col span={3} offset={1}>
              <Button
                type="primary"
                disabled
                onClick={() => this.changeBuilding(2, '/buildingDcCheck/match')}
              >
                转他人
              </Button>
            </Col>
            <Col span={3} offset={1}>
              {processState === '4' ? (
                <Button type="dashed" disabled>
                  暂不处理
                </Button>
              ) : (
                <Popconfirm
                  title="已有关联匹配将被清除，是否确定暂不处理？"
                  onConfirm={() =>
                    this.changeBuilding(0, '/buildingDcCheck/notMatch')
                  }
                  okText="确认"
                  cancelText="取消"
                >
                  <Button type="dashed">暂不处理</Button>
                </Popconfirm>
              )}
            </Col>
            <Col span={3} offset={1}>
              <Popconfirm
                title="已有关联匹配将被清除，是否确定丢垃圾箱？"
                onConfirm={() =>
                  this.changeBuilding(4, '/buildingDcCheck/trash')
                }
                okText="确认"
                cancelText="取消"
              >
                <Button type="dashed">丢垃圾箱</Button>
              </Popconfirm>
            </Col>
            <Col span={3} offset={1}>
              <Link
                to={{
                  pathname: router.AUDIT_NUMBER,
                  search: `buildingIds=${this.state.id}`
                }}
              >
                <Button type="primary" disabled={!(processState === '2')}>
                  转房号处理
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  renderTable() {
    const { getFieldDecorator } = this.props.form
    const { authorityList } = this.props
    const {
      fdcProjectStatus,
      flag,
      cityName,
      areaName,
      projectName // eslint-disable-line
    } = this.state
    const { fdcBuildList } = this.props
    const { pageNum, pageSize, total } = this.props.model.get('pagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handleSearch(null, pageNum)
      }
    }
    const { fdcBuildingId } = this.props.buildDetail
    const columns = [
      ...editColumns,
      {
        title: '关联操作',
        width: 100,
        dataIndex: 'matchCurrent',
        render: (matchCurrent, { id, matchStatus }) => (
          <div>
            {matchCurrent === 0 ? (
              <div>
                {matchStatus === 0 ? (
                  <div>
                    {fdcBuildingId ? (
                      <Switch checked={!!matchCurrent} onClick={this.infoDc} />
                    ) : (
                      <Switch
                        checked={!!matchCurrent}
                        onChange={() =>
                          this.changeStatus(matchStatus, id, matchCurrent)
                        }
                      />
                    )}
                  </div>
                ) : (
                  <Switch checked={!!matchCurrent} onClick={this.infoFdc} />
                )}
              </div>
            ) : (
              <div>
                <Switch checked={!!matchCurrent} onClick={this.showModal} />
                <Modal
                  visible={this.state.visible}
                  onOk={() => this.handleOk(matchStatus, id, matchCurrent)}
                  onCancel={this.handleCancel}
                  okText="是"
                  cancelText="否"
                  closable={false}
                >
                  <p>
                    将取消该楼栋的匹配关联，甚至是该楼栋下的楼栋、单元室号的关联，是否确定取消？
                  </p>
                </Modal>
              </div>
            )}
          </div>
        )
      }
    ]
    return (
      <div>
        {flag === 1 ? (
          <div className={styles.editTable}>
            <div className={styles.flexMiddle}>
              <div className={styles.flexborder}>
                {cityName}-{areaName}-{projectName}
              </div>
              <div className={styles.flexBox}>
                <div className={styles.flexBoxLeft}>
                  <div className={styles.flexLabel}>关键字：</div>
                  <div className={styles.flexInput}>
                    {getFieldDecorator('keyword')(<Input />)}
                  </div>
                </div>
                <div className={styles.flexBoxButton}>
                  <Button type="primary" onClick={e => this.handleSearch(e, 1)}>
                    查询
                  </Button>
                </div>
                {/* 新建楼栋按钮 */}
                {fdcProjectStatus === '1' ? (
                  <div className={styles.flexBoxButton}>
                    {authorityList[0] === 1000 ? (
                      <Button onClick={this.openHouse}>新建楼栋</Button>
                    ) : (
                      <Button onClick={() => this.authorityModal()}>
                        新建楼栋
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={styles.flexBoxButton}>
                    <Popover
                      content="已删除楼盘，无法新建楼栋。"
                      trigger="hover"
                    >
                      <Button disabled>新建楼栋</Button>
                    </Popover>
                  </div>
                )}
              </div>
            </div>
            <Table
              columns={columns}
              rowKey="id"
              dataSource={fdcBuildList}
              pagination={pagination}
              loading={this.context.loading.includes(
                actions.GET_FDC_BUILD_LIST
              )}
              className={styles.defineTable}
            />
          </div>
        ) : (
          ''
        )}

        {flag === 2 ? <div>122</div> : ''}
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
        </div>
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(AuditBuildingEdit)
