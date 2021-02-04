import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { parse } from 'qs'
import { setSession, getSession, removeSession } from 'client/utils/assist'
import { Link } from 'react-router-dom'
import isNode from 'detect-node'
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
  Popconfirm,
  Popover,
  Message,
  Switch,
  Modal
} from 'antd'
import showTotal from 'client/utils/showTotal'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './AuditFloor.less'
import { breadEditList, editColumns } from './constant'

/**
 * @description 数据审核-DC模块
 * @author WY
 */

class AuditFloorEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    getInformationList: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getMatchList: PropTypes.func.isRequired,
    matchList: PropTypes.array.isRequired,
    projectDcCheckCB: PropTypes.func.isRequired,
    InformationList: PropTypes.object.isRequired,
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
      id: search.id,
      // fdcProjectId: search.fdcProjectId,
      cityId: search.cityId,
      cityName: search.cityName,
      areaId: search.areaId,
      projectName: search.projectName,
      projectAlias: search.projectAlias,
      processState:
        !isNode && getSession('auditState')
          ? getSession('auditState')
          : search.processState,
      visible: false,
      flagShow: 'inline-block',
      flagHide: 'none',
      contentHeight: '380px',
      labelHeight: '255px',
      flag: 0 // 0 为隐藏 1转正式 2转他人
    }
  }

  componentDidMount() {
    this.props.getInformationList(this.state.id)
    const { processState } = this.state
    if (processState === '2') {
      this.changeBuilding(1, null)
    }
    this.props.getAuthorityList({ cityId: this.state.cityId })
  }
  // 转楼栋处理 是否可点击
  componentWillUnmount() {
    if (getSession('auditState')) {
      removeSession('auditState')
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
      title: '该DC楼盘已关联了FDC的另一个楼盘'
    })
  }

  infoFdc() {
    Modal.warning({
      title: '该FDC楼盘已被DC的另一个楼盘关联了'
    })
  }

  changeStatus = (matchStatus, sid, matchCurrent) => {
    const { id } = this.state
    const params = {
      id,
      matchStatus: matchStatus ? 0 : 1,
      matchId: sid
    }
    this.props.projectDcCheckCB(
      '/projectDcCheck/match',
      params,
      (code, message) => {
        if (code === '200') {
          this.changeBuilding(1, null)
          this.props.getInformationList(id)
          if (matchCurrent === 0) {
            Message.success('关联成功')
            this.setState({ processState: '2' }, () => {
              setSession('auditState', this.state.processState)
            })
          }
          if (matchCurrent === 1) {
            Message.success('取消关联成功')
            this.setState({ processState: '1' }, () => {
              setSession('auditState', this.state.processState)
            })
          }
        } else {
          Message.error(message)
        }
      }
    )
  }

  changeBuilding = (flag, url) => {
    const {
      cityId,
      areaId,
      id,
      projectName,
      projectAlias // eslint-disable-line
    } = this.state
    this.setState({ flag })
    if (flag === 1) {
      const params = {
        projectId: id,
        pageNum: 1,
        pageSize: 20,
        cityId,
        areaId,
        projectName,
        projectAlias
      }
      this.props.getMatchList(params)
    } else {
      // 自行判断
      this.props.projectDcCheckCB(url, { id }, (code, message) => {
        if (code === '200') {
          Message.success('操作成功')
          // eslint-disable-next-line
          const { areaId, fdcProjectId, keyword, cityValues, pageNum } = parse(
            sessionStorage.getItem('AUDIT_FLOOR_SEARCH')
          )
          const baseInfoSearch = `keyword=${keyword ||
            ''}&fdcProjectId=${fdcProjectId ||
            ''}&cityValues=${cityValues}&areaId=${areaId}&pageNum=${pageNum}`
          // 将DC楼盘列表查询条件设置到 sessionStorage
          sessionStorage.setItem('AUDIT_FLOOR_SEARCH', baseInfoSearch)
          this.context.router.history.push({
            pathname: router.AUDIT_FLOOR,
            search: baseInfoSearch
          })
        } else {
          Message.error(message)
        }
      })
    }
  }

  // 搜索
  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    const { cityId, areaId, id } = this.state
    this.props.form.validateFields(['keyword'], (err, values) => {
      if (!err) {
        const params = {
          projectId: id,
          pageNum: pageNum || 1,
          pageSize: 20,
          cityId,
          areaId,
          keyword: values.keyword
        }
        this.props.getMatchList(params)
      }
    })
  }

  openHouse = () => {
    const { cityId, cityName } = this.state
    this.props.updateVisitCities({ cityId, cityName }, () => {
      window.open(`${router.RES_BASEINFO_ADD}?cityId=${cityId}`)
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
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  authorityModal() {
    Modal.error({
      title: '温馨提示：',
      content: '你没有该楼盘的城市权限，不允许下一步操作'
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
    const { InformationList } = this.props
    const {
      // 判断转楼栋处理 是否可点击
      processState,
      flagShow,
      flagHide,
      contentHeight,
      labelHeight // eslint-disable-line
    } = this.state

    const contentPop = (
      <div className={styles.contentPop}>{InformationList.address}</div>
    )
    const showPop = !!(
      InformationList.address && InformationList.address.length > 12
    )
    // 楼盘名称
    const contentProjectName = (
      <div className={styles.contentPop}>{InformationList.projectName}</div>
    )
    const showProjectName = !!(
      InformationList.projectName && InformationList.projectName.length > 12
    )
    // 楼盘别名
    const contentProjectAlias = (
      <div className={styles.contentPop}>{InformationList.projectAlias}</div>
    )
    const showProjectAlias = !!(
      InformationList.projectAlias && InformationList.projectAlias.length > 12
    )
    // 宗地编号
    const contentLandNo = (
      <div className={styles.contentPop}>{InformationList.landNo}</div>
    )
    const showLandNo = !!(
      InformationList.landNo && InformationList.landNo.length > 12
    )
    // 入伙日期 后期可能会修改
    const joinInTime = InformationList.onboardingDate
      ? InformationList.onboardingDate.split('T', 1)
      : ''
    const contentOnboardingDate = (
      <div className={styles.contentPop}>{joinInTime}</div>
    )
    const showOnboardingDate = !!(joinInTime && joinInTime.length > 12)
    // 管理处电话
    const contentOfficePhone = (
      <div className={styles.contentPop}>{InformationList.officePhone}</div>
    )
    const showOfficePhone = !!(
      InformationList.officePhone && InformationList.officePhone.length > 12
    )
    // 物业费
    const contentManagementFee = (
      <div className={styles.contentPop}>{InformationList.managementFee}</div>
    )
    const showManagementFee = !!(
      InformationList.managementFee && InformationList.managementFee.length > 12
    )
    // 楼盘概况
    const contentDetail = (
      <div className={styles.contentPop}>{InformationList.detail}</div>
    )
    const showDetail = !!(
      InformationList.detail && InformationList.detail.length > 12
    )
    // 地下室用途
    const contentBasementPurpose = (
      <div className={styles.contentPop}>{InformationList.basementPurpose}</div>
    )
    const showBasementPurpose = !!(
      InformationList.basementPurpose &&
      InformationList.basementPurpose.length > 12
    )
    // 有利因素
    const contentPositiveFactor = (
      <div className={styles.contentPop}>{InformationList.positiveFactor}</div>
    )
    const showPositiveFactor = !!(
      InformationList.positiveFactor &&
      InformationList.positiveFactor.length > 12
    )
    // 不利因素
    const contentNegetiveFactor = (
      <div className={styles.contentPop}>{InformationList.negetiveFactor}</div>
    )
    const showNegetiveFactor = !!(
      InformationList.negetiveFactor &&
      InformationList.negetiveFactor.length > 12
    )
    // 设备设施
    const contentFacility = (
      <div className={styles.contentPop}>{InformationList.facility}</div>
    )
    const showFacility = !!(
      InformationList.facility && InformationList.facility.length > 12
    )
    // 区域分析
    const contentRegionalAnalysis = (
      <div className={styles.contentPop}>
        {InformationList.regionalAnalysis}
      </div>
    )
    const showRegionalAnalysis = !!(
      InformationList.regionalAnalysis &&
      InformationList.regionalAnalysis.length > 12
    )
    // 车位描述
    const contentParkingPlaceDesc = (
      <div className={styles.contentPop}>
        {InformationList.parkingPlaceDesc}
      </div>
    )
    const showParkingPlaceDesc = !!(
      InformationList.parkingPlaceDesc &&
      InformationList.parkingPlaceDesc.length > 12
    )
    // 对外交通
    const contentExternalTransportation = (
      <div className={styles.contentPop}>
        {InformationList.externalTransportation}
      </div>
    )
    const showExternalTransportation = !!(
      InformationList.externalTransportation &&
      InformationList.externalTransportation.length > 12
    )
    // 东
    const contentEast = (
      <div className={styles.contentPop}>{InformationList.east}</div>
    )
    const showEast = !!(
      InformationList.east && InformationList.east.length > 12
    )
    // 西
    const contentWest = (
      <div className={styles.contentPop}>{InformationList.west}</div>
    )
    const showWest = !!(
      InformationList.west && InformationList.west.length > 12
    )
    // 南
    const contentSouth = (
      <div className={styles.contentPop}>{InformationList.south}</div>
    )
    const showSouth = !!(
      InformationList.south && InformationList.south.length > 12
    )
    // 北
    const contentNorth = (
      <div className={styles.contentPop}>{InformationList.north}</div>
    )
    const showNorth = !!(
      InformationList.north && InformationList.north.length > 12
    )
    // 楼盘备注
    const contentRemark = (
      <div className={styles.contentPop}>{InformationList.remark}</div>
    )
    const showRemark = !!(
      InformationList.remark && InformationList.remark.length > 12
    )
    // 车位配比
    const contentParkingSpaceRatio = (
      <div className={styles.contentPop}>
        {InformationList.parkingSpaceRatio}
      </div>
    )
    const showParkingSpaceRatio = !!(
      InformationList.parkingSpaceRatio &&
      InformationList.parkingSpaceRatio.length > 12
    )
    // 楼盘特色
    const contentProjectFeature = (
      <div className={styles.contentPop}>{InformationList.projectFeature}</div>
    )
    const showProjectFeature = !!(
      InformationList.projectFeature &&
      InformationList.projectFeature.length > 12
    )
    // 轨道沿线
    const contentSubway = (
      <div className={styles.contentPop}>{InformationList.subway}</div>
    )
    const showSubway = !!(
      InformationList.subway && InformationList.subway.length > 12
    )
    return (
      <div className={styles.contentShow}>
        <div className={styles.contentAll} style={{ height: contentHeight }}>
          <div>
            <span className={styles.titleStyle} />
            DC楼盘详细信息：
          </div>
          <div className={styles.labelAll} style={{ height: labelHeight }}>
            <Row>
              <Col span={12}>
                <span className={styles.labelRight}>数据建设机构：</span>
                <span>{InformationList.companyName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>数据修改机构：</span>
                <span>{InformationList.updateCompanyName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘创建账号：</span>
                <span>{InformationList.creator}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘创建时间：</span>
                <span>
                  {InformationList.crtTime
                    ? InformationList.crtTime.split('T', 1)
                    : ''}
                </span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘修改账号：</span>
                <span>{InformationList.modifier}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘修改时间：</span>
                <span>
                  {InformationList.modTime
                    ? InformationList.modTime.split('T', 1)
                    : ''}
                </span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘名称：</span>
                {showProjectName ? (
                  <Popover content={contentProjectName} trigger="hover">
                    <span className={styles.limitAreaName}>
                      {InformationList.projectName}
                    </span>
                  </Popover>
                ) : (
                  <span>{InformationList.projectName}</span>
                )}
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘别名：</span>
                {showProjectAlias ? (
                  <Popover content={contentProjectAlias} trigger="hover">
                    <span className={styles.limitAreaName}>
                      {InformationList.projectAlias}
                    </span>
                  </Popover>
                ) : (
                  <span>{InformationList.projectAlias}</span>
                )}
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘ID：</span>
                <span>{InformationList.id}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>主用途：</span>
                <span>{InformationList.usage}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>城市：</span>
                <span>{InformationList.cityName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>行政区：</span>
                <span>{InformationList.areaName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘均价：</span>
                <span>{InformationList.projectAvgPrice}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>开盘均价：</span>
                <span>{InformationList.openingAvgPrice}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>竣工日期：</span>
                <span>
                  {InformationList.deliveryDate
                    ? InformationList.deliveryDate.split('T', 1)
                    : ''}
                </span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>主建筑类型：</span>
                <span>{InformationList.buildingType}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>建筑面积：</span>
                <span>{InformationList.buildingArea}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘地址：</span>
                {showPop ? (
                  <Popover content={contentPop} trigger="hover">
                    <span className={styles.limitAreaName}>
                      {InformationList.address}
                    </span>
                  </Popover>
                ) : (
                  <span>{InformationList.address}</span>
                )}
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>经度：</span>
                <span>{InformationList.longitude}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>纬度：</span>
                <span>{InformationList.latitude}</span>
              </Col>
              {InformationList.subAreaId ? (
                <Col span={12}>
                  <span className={styles.labelRight}>片区ID：</span>
                  <span>{InformationList.subAreaId}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.landNo ? (
                <Col span={12}>
                  <span className={styles.labelRight}>宗地编号：</span>
                  <span>{InformationList.landNo}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.landArea ? (
                <Col span={12}>
                  <span className={styles.labelRight}>土地占地面积：</span>
                  {showLandNo ? (
                    <Popover content={contentLandNo} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.landArea}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.landArea}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.landStartDate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>土地起始日期：</span>
                  <span>
                    {InformationList.landStartDate
                      ? InformationList.landStartDate.split('T', 1)
                      : ''}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.landEndDate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>土地终止日期：</span>
                  <span>
                    {InformationList.landEndDate
                      ? InformationList.landEndDate.split('T', 1)
                      : ''}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.landUsageDuration ? (
                <Col span={12}>
                  <span className={styles.labelRight}>土地使用年限：</span>
                  <span>{InformationList.landUsageDuration}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.officeArea ? (
                <Col span={12}>
                  <span className={styles.labelRight}>办公面积：</span>
                  <span>{InformationList.officeArea}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.businessArea ? (
                <Col span={12}>
                  <span className={styles.labelRight}>商业面积：</span>
                  <span>{InformationList.businessArea}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.capacityRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>容积率：</span>
                  <span>{InformationList.capacityRate}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.greenRate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>绿化率：</span>
                  <span>{InformationList.greenRate}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.openingDate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>开盘日期：</span>
                  <span>
                    {InformationList.openingDate
                      ? InformationList.openingDate.split('T', 1)
                      : ''}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.onboardingDate ? (
                <Col span={12}>
                  <span className={styles.labelRight}>入伙日期：</span>
                  {showOnboardingDate ? (
                    <Popover content={contentOnboardingDate} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.onboardingDate
                          ? InformationList.onboardingDate.split('T', 1)
                          : ''}
                      </span>
                    </Popover>
                  ) : (
                    <span>
                      {InformationList.onboardingDate
                        ? InformationList.onboardingDate.split('T', 1)
                        : ''}
                    </span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.parkingNum ? (
                <Col span={12}>
                  <span className={styles.labelRight}>车位数：</span>
                  <span>{InformationList.parkingNum}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.officePhone ? (
                <Col span={12}>
                  <span className={styles.labelRight}>管理处电话：</span>
                  {showOfficePhone ? (
                    <Popover content={contentOfficePhone} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.officePhone}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.officePhone}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.managementFee ? (
                <Col span={12}>
                  <span className={styles.labelRight}>物业费：</span>
                  {showManagementFee ? (
                    <Popover content={contentManagementFee} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.managementFee}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.managementFee}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.totalHouseNum ? (
                <Col span={12}>
                  <span className={styles.labelRight}>总套数：</span>
                  <span>{InformationList.totalHouseNum}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.totalBuildingNum ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼栋数：</span>
                  <span>{InformationList.totalBuildingNum}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.detail ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼盘概况：</span>
                  {showDetail ? (
                    <Popover content={contentDetail} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.detail}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.detail}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.buildingType ? (
                <Col span={12}>
                  <span className={styles.labelRight}>主建筑物类型：</span>
                  <span>{InformationList.buildingType}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.isBasedataCompleted ? (
                <Col span={12}>
                  <span className={styles.labelRight}>是否完成基础数据：</span>
                  <span>
                    {InformationList.isBasedataCompleted ? '是' : '否'}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.isAbleEvaluated ? (
                <Col span={12}>
                  <span className={styles.labelRight}>可估：</span>
                  <span>{InformationList.isAbleEvaluated ? '是' : '否'}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.basementPurpose ? (
                <Col span={12}>
                  <span className={styles.labelRight}>地下室用途：</span>
                  {showBasementPurpose ? (
                    <Popover content={contentBasementPurpose} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.basementPurpose}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.basementPurpose}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.positiveFactor ? (
                <Col span={12}>
                  <span className={styles.labelRight}>有利因素：</span>
                  {showPositiveFactor ? (
                    <Popover content={contentPositiveFactor} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.positiveFactor}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.positiveFactor}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.negetiveFactor ? (
                <Col span={12}>
                  <span className={styles.labelRight}>不利因素：</span>
                  {showNegetiveFactor ? (
                    <Popover content={contentNegetiveFactor} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.negetiveFactor}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.negetiveFactor}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.facility ? (
                <Col span={12}>
                  <span className={styles.labelRight}>设备设施：</span>
                  {showFacility ? (
                    <Popover content={contentFacility} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.facility}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.facility}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.regionalAnalysis ? (
                <Col span={12}>
                  <span className={styles.labelRight}>区域分析：</span>
                  {showRegionalAnalysis ? (
                    <Popover content={contentRegionalAnalysis} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.regionalAnalysis}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.regionalAnalysis}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.parkingPlaceDesc ? (
                <Col span={12}>
                  <span className={styles.labelRight}>车位描述：</span>
                  {showParkingPlaceDesc ? (
                    <Popover content={contentParkingPlaceDesc} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.parkingPlaceDesc}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.parkingPlaceDesc}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.transportationConvenientRatioCode ? (
                <Col span={12}>
                  <span className={styles.labelRight}>车辆出行便利度：</span>
                  <span>
                    {InformationList.transportationConvenientRatioCode}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.isTrafficControlled ? (
                <Col span={12}>
                  <span className={styles.labelRight}>交通管制：</span>
                  <span>
                    {InformationList.isTrafficControlled ? '是' : '否'}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.externalTransportation ? (
                <Col span={12}>
                  <span className={styles.labelRight}>对外交通：</span>
                  {showExternalTransportation ? (
                    <Popover
                      content={contentExternalTransportation}
                      trigger="hover"
                    >
                      <span className={styles.limitAreaName}>
                        {InformationList.externalTransportation}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.externalTransportation}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.dataSource ? (
                <Col span={12}>
                  <span className={styles.labelRight}>数据来源：</span>
                  <span>{InformationList.dataSource}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.east ? (
                <Col span={12}>
                  <span className={styles.labelRight}>东：</span>
                  {showEast ? (
                    <Popover content={contentEast} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.east}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.east}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.west ? (
                <Col span={12}>
                  <span className={styles.labelRight}>西：</span>
                  {showWest ? (
                    <Popover content={contentWest} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.west}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.west}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.south ? (
                <Col span={12}>
                  <span className={styles.labelRight}>南：</span>
                  {showSouth ? (
                    <Popover content={contentSouth} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.south}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.south}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.north ? (
                <Col span={12}>
                  <span className={styles.labelRight}>北：</span>
                  {showNorth ? (
                    <Popover content={contentNorth} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.north}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.north}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.isSchoolDistrictHouse ? (
                <Col span={12}>
                  <span className={styles.labelRight}>学区房：</span>
                  <span>
                    {InformationList.isSchoolDistrictHouse ? '是' : '否'}
                  </span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.remark ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼盘备注：</span>
                  <span>{InformationList.remark}</span>
                  {showRemark ? (
                    <Popover content={contentRemark} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.remark}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.remark}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.parkingSpaceRatio ? (
                <Col span={12}>
                  <span className={styles.labelRight}>车位配比：</span>
                  {showParkingSpaceRatio ? (
                    <Popover content={contentParkingSpaceRatio} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.parkingSpaceRatio}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.parkingSpaceRatio}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.isPulledDown ? (
                <Col span={12}>
                  <span className={styles.labelRight}>拆迁：</span>
                  <span>{InformationList.isPulledDown ? '是' : '否'}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.ownershipType ? (
                <Col span={12}>
                  <span className={styles.labelRight}>产权形式：</span>
                  <span>{InformationList.ownershipType}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.buildingQuality ? (
                <Col span={12}>
                  <span className={styles.labelRight}>建筑质量：</span>
                  <span>{InformationList.buildingQuality}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.managementQuality ? (
                <Col span={12}>
                  <span className={styles.labelRight}>物业管理质量：</span>
                  <span>{InformationList.managementQuality}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.communitySize ? (
                <Col span={12}>
                  <span className={styles.labelRight}>小区规模：</span>
                  <span>{InformationList.communitySize}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.landLevel ? (
                <Col span={12}>
                  <span className={styles.labelRight}>土地级别：</span>
                  <span>{InformationList.landLevel}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.communityCloseness ? (
                <Col span={12}>
                  <span className={styles.labelRight}>小区封闭性：</span>
                  <span>{InformationList.communityCloseness}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.actualUsage ? (
                <Col span={12}>
                  <span className={styles.labelRight}>实际用途：</span>
                  <span>{InformationList.actualUsage}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.decoration ? (
                <Col span={12}>
                  <span className={styles.labelRight}>装修情况：</span>
                  <span>{InformationList.decoration}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.objectType ? (
                <Col span={12}>
                  <span className={styles.labelRight}>物业类型：</span>
                  <span>{InformationList.objectType}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.parkingStatus ? (
                <Col span={12}>
                  <span className={styles.labelRight}>停车位状况：</span>
                  <span>{InformationList.parkingStatus}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.diversionVehicle ? (
                <Col span={12}>
                  <span className={styles.labelRight}>人车分流情况：</span>
                  <span>{InformationList.diversionVehicle}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.transportationConvenientRatio ? (
                <Col span={12}>
                  <span className={styles.labelRight}>车辆出行便利度：</span>
                  <span>{InformationList.transportationConvenientRatio}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.projectClass ? (
                <Col span={12}>
                  <span className={styles.labelRight}>配套等级：</span>
                  <span>{InformationList.projectClass}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.projectFeature ? (
                <Col span={12}>
                  <span className={styles.labelRight}>楼盘特色：</span>
                  {showProjectFeature ? (
                    <Popover content={contentProjectFeature} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.projectFeature}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.projectFeature}</span>
                  )}
                </Col>
              ) : (
                ''
              )}
              {InformationList.projectLandPlanUsage ? (
                <Col span={12}>
                  <span className={styles.labelRight}>土地规划用途：</span>
                  <span>{InformationList.projectLandPlanUsage}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.loopLine ? (
                <Col span={12}>
                  <span className={styles.labelRight}>环线位置：</span>
                  <span>{InformationList.loopLine}</span>
                </Col>
              ) : (
                ''
              )}
              {InformationList.subway ? (
                <Col span={12}>
                  <span className={styles.labelRight}>轨道沿线：</span>
                  {showSubway ? (
                    <Popover content={contentSubway} trigger="hover">
                      <span className={styles.limitAreaName}>
                        {InformationList.subway}
                      </span>
                    </Popover>
                  ) : (
                    <span>{InformationList.subway}</span>
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
              {processState === '2' ? (
                <Button type="primary">楼盘关联</Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() =>
                    this.changeBuilding(1, '/projectDcCheck/match')
                  }
                >
                  楼盘关联
                </Button>
              )}
            </Col>
            <Col span={3} offset={1}>
              <Button
                type="primary"
                disabled
                onClick={() => this.changeBuilding(2)}
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
                    this.changeBuilding(0, '/projectDcCheck/notMatch')
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
                  this.changeBuilding(4, '/projectDcCheck/trash')
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
                  pathname: router.AUDIT_BUILDING,
                  search: `projectIds=${this.state.id}`
                }}
              >
                <Button type="primary" disabled={!(processState === '2')}>
                  转楼栋处理
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

    const fdcProjectId = this.props.InformationList.fdcProjectId

    const { flag, processState } = this.state
    const editColumn = [
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
                    {fdcProjectId ? (
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
                    将取消该楼盘的匹配关联，甚至是该楼盘下的楼栋、单元室号的关联，是否确定取消？
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
        {processState === '2' ? (
          <div className={styles.editTable}>
            <div className={styles.flexMiddle}>
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
                <div className={styles.flexBoxButton}>
                  {authorityList[0] === 1000 ? (
                    <Button onClick={this.openHouse}>新增楼盘</Button>
                  ) : (
                    <Button onClick={() => this.authorityModal()}>
                      新增楼盘
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <Table
              columns={editColumn}
              rowKey="id"
              dataSource={this.props.matchList}
              pagination={pagination}
              loading={this.context.loading.includes(actions.GET_MATCH_LIST)}
              className={styles.defineTable}
            />
          </div>
        ) : (
          <div>
            {flag === 1 ? (
              <div className={styles.editTable}>
                <div className={styles.flexMiddle}>
                  <div className={styles.flexBox}>
                    <div className={styles.flexBoxLeft}>
                      <div className={styles.flexLabel}>关键字：</div>
                      <div className={styles.flexInput}>
                        {getFieldDecorator('keyword')(<Input />)}
                      </div>
                    </div>
                    <div className={styles.flexBoxButton}>
                      <Button
                        type="primary"
                        onClick={e => this.handleSearch(e, 1)}
                      >
                        查询
                      </Button>
                    </div>
                    <div className={styles.flexBoxButton}>
                      {authorityList[0] === 1000 ? (
                        <Button onClick={this.openHouse}>新增楼盘</Button>
                      ) : (
                        <Button onClick={() => this.authorityModal()}>
                          新增楼盘
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <Table
                  columns={editColumn}
                  rowKey="id"
                  dataSource={this.props.matchList}
                  pagination={pagination}
                  loading={this.context.loading.includes(
                    actions.GET_MATCH_LIST
                  )}
                  className={styles.defineTable}
                />
              </div>
            ) : (
              ''
            )}
            {flag === 2 ? <Button>123</Button> : ''}
          </div>
        )}
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
)(AuditFloorEdit)
