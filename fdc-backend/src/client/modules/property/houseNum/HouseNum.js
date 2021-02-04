import React, { Component } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Row, Button, Modal, Alert, Breadcrumb, Icon } from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import classnames from 'classnames'

import router from 'client/router'
import { pagePermission } from 'client/utils'
import { tabList } from './HouseNum.config'
import HouseName from './HouseName'
import StandardRate from './StandardRate'
import PriceRate from './PriceRate'
import RentPriceRate from './RentPriceRate'
import HouseArea from './HouseArea'
import IsAreaConfirmed from './IsAreaConfirmed'
import HouseInternalArea from './HouseInternalArea'
import UsageCode from './UsageCode'
import HouseTypeCode from './HouseTypeCode'
import StructureCode from './StructureCode'
import OrientationCode from './OrientationCode'
import SightCode from './SightCode'
import VentLightCode from './VentLightCode'
import NoiseCode from './NoiseCode'
import DecorationCode from './DecorationCode'
import SubHouseType from './SubHouseType'
import IsBear from './IsBear' // wy 是否证载
import SubHouseArea from './SubHouseArea'
import UnitPrice from './UnitPrice'
import IsWithKitchen from './IsWithKitchen'
import BalconyNum from './BalconyNum'
import WashroomNum from './WashroomNum'
import HasGarden from './HasGarden'
import IsAbleEvaluated from './IsAbleEvaluated'
import Ownership from './Ownership'
import IsLocked from './IsLocked'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './HouseNum.less'

// const TabPane = Tabs.TabPane
const confirm = Modal.confirm

/**
 * 房号列表
 * author: YJF
 */
class HouseNum extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    getBuildDetail: PropTypes.func.isRequired,
    buildStatus: PropTypes.number.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    // buildId: 176034497935951192
    // eslint-disable-next-line
    const { projectId, buildId, cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      // 当前激活的tab
      currentTabKey: 'houseName',
      // 楼盘ID
      projectId,
      // 楼栋ID
      buildId,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      // this.cityName =
      //   JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || '北京市'
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        // 获取楼栋详情
        this.getBuildDetail()
        // 获取楼盘详情 定制面包屑需要
        this.props.getProjectDetail(this.state.projectId, this.cityId)
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  getBuildDetail = () => {
    if (this.state.buildId) {
      const params = {
        cityId: this.cityId,
        tabType: 1,
        buildId: this.state.buildId
      }
      this.props.getBuildDetail(params)
    }
  }

  handleChangeTabKey = key => {
    const that = this
    if (that.props.buildStatus === 1) {
      if (that.state.currentTabKey === 'houseName' && key !== 'houseName') {
        confirm({
          title: '是否离开房号列表页？',
          content: '请确保房号列表已保存！',
          onOk() {
            that.setState({
              currentTabKey: key
            })
          }
        })
      } else {
        this.setState({
          currentTabKey: key
        })
      }
    } else {
      this.setState({
        currentTabKey: key
      })
    }
  }

  renderBreads() {
    /* eslint-disable */
    setTimeout(()=>{
    },1000)
    const { projectDetail, buildDetail } = this.props.model
    const { areaId, areaName, id, projectName, sysStatus } = projectDetail
    const { buildingName } = buildDetail
    const { cityId, cityName } = this.state

    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_BASEINFO,
        name: '住宅基础数据'
      },
      {
        key: 3,
        path: router.RES_BASEINFO,
        name: areaName,
        search: `areaId=${areaId}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 4,
        path: router.RES_BASEINFO_ADD,
        name:
          projectName && projectName.length > 10
            ? `${projectName.substr(0, 10)}...`
            : projectName,
        search: `projectId=${id}&status=${sysStatus}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 5,
        path: router.RES_BUILD_INFO,
        name: '楼栋列表',
        search: `projectId=${id}&prjStatus=${sysStatus}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 6,
        path: router.RES_BUILD_INFO_ADD,
        name:
          buildingName && buildingName.length > 10
            ? `${buildingName.substr(0, 10)}...`
            : buildingName,
        search: `projectId=${id}&buildId=${
          this.state.buildId
        }&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 7,
        path: '',
        name: '房号列表'
      }
    ]

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link
                to={{
                  pathname: item.path,
                  search: item.search
                }}
              >
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderTitle() {
    const { cityId, cityName } = this.state
    return (
      <Row>
        {this.props.buildStatus === 1 ? (
          <div>
            <Link
              to={{
                pathname: router.RES_BASEINFO_IMPORT,
                // search: 'importType=1212004'
                search: `importType=${1212004}&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:import') ? (
                <Button
                  style={{ marginRight: 16 }}
                  icon="upload"
                  type="primary"
                >
                  导入
                </Button>
              ) : (
                ''
              )}
            </Link>
            <Link
              to={{
                pathname: router.RES_PRO_EXPORT,
                // search: 'exportType=3'
                search: `exportType=${3}&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              <Button
                style={{ marginRight: 16 }}
                icon="download"
                type="primary"
              >
                导出
              </Button>
            </Link>
          </div>
        ) : null}
      </Row>
    )
  }

  renderTotalFloor() {
    // const { totalFloorNum } = this.state
    const { buildDetail } = this.props.model
    const totalFloorNum = buildDetail.get('totalFloorNum')

    // const buildDetail = this.props.model.get('buildDetail')

    return (
      <Row style={{ marginTop: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              楼栋总楼层&nbsp;
              <span style={{ fontWeight: 600, color: '#33CABB' }}>
                {totalFloorNum}
              </span>
            </p>
          }
          type="info"
          showIcon
        />
      </Row>
    )
  }

  renderTabs = () => {
    const { currentTabKey } = this.state
    return (
      // <Tabs
      //   activeKey={this.state.currentTabKey}
      //   onChange={this.handleChangeTabKey}
      // >
      //   {tabList.map(tab => (
      //     <TabPane tab={tab.name} key={tab.id} />
      //   ))}
      // </Tabs>
      <div className={styles.tabContainer}>
        {tabList.map(item => (
          <div
            className={classnames(
              styles.tabItem,
              currentTabKey === item.id ? styles.active : ''
            )}
            key={item.id}
            onClick={() => this.handleChangeTabKey(item.id)}
          >
            {item.name}
          </div>
        ))}
      </div>
    )
  }

  renderTable() {
    const { projectId, buildId, cityId, cityName } = this.state

    return (
      <div>
        {
          {
            houseName: (
              <HouseName
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            standardRate: (
              <StandardRate
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            priceRate: (
              <PriceRate
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            rentRate: (
              <RentPriceRate
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            houseArea: (
              <HouseArea
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            isAreaConfirmed: (
              <IsAreaConfirmed
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            houseInternalArea: (
              <HouseInternalArea
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            usageCode: (
              <UsageCode
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            houseTypeCode: (
              <HouseTypeCode
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            structureCode: (
              <StructureCode
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            orientationCode: (
              <OrientationCode
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            sightCode: (
              <SightCode
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            ventLightCode: (
              <VentLightCode
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            noiseCode: (
              <NoiseCode
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            decorationCode: (
              <DecorationCode
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            subHouseType: (
              <SubHouseType
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            isBear: (
              <IsBear
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            subHouseArea: (
              <SubHouseArea
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            unitprice: (
              <UnitPrice
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            isWithKitchen: (
              <IsWithKitchen
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            balconyNum: (
              <BalconyNum
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            washroomNum: (
              <WashroomNum
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            hasGarden: (
              <HasGarden
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            isAbleEvaluated: (
              <IsAbleEvaluated
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            ownership: (
              <Ownership
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            ),
            isLocked: (
              <IsLocked
                buildId={buildId}
                projectId={projectId}
                cityId={cityId}
                cityName={cityName}
              />
            )
          }[this.state.currentTabKey]
        }
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderTitle()}
          {this.renderTotalFloor()}
          {this.renderTabs()}
          {this.renderTable()}
        </div>
      </div>
    )
  }
}

export default compose(
  connect(
    modelSelector,
    containerActions
  )
)(HouseNum)
