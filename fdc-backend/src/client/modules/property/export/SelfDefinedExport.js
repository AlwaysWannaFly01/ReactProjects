import React, { Component } from 'react'
import { Tabs, Breadcrumb, Icon } from 'antd'
import PropTypes from 'prop-types'
import { parse } from 'qs'

import BuildingSelected from './BuildingSelected.jsx'
import BuildingZoneSelected from './BuildingZoneSelected.jsx'
import RoomNum from './RoomNum.jsx'
// import { buildingOptions as options } from './config' // 开发数据
import areaData from './utils/areaRow'
import buildingData from './utils/buildingRow'
import roomData from './utils/roomData'

import styles from './style.less'

const TabPane = Tabs.TabPane
/**
 * author: LiuYaoChange
 * create Date: 2018-05-14
 * version: 1.0
 */

class SelfDefinedExport extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    updateVisitCities: PropTypes.func
  }

  constructor(props) {
    super(props)

    const { exportType = '2', cityId = '', cityName = '' } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      activeTab: exportType,
      cityId,
      cityName
    }

    this.handleTabChange = this.handleTabChange.bind(this)
    this.initLoadData() // 初始加载数据
  }

  // componentDidMount() {
  //   const { cityId, cityName } = this.state
  //   console.log(cityId, cityName)
  //   if (cityId) {
  //     this.props.updateVisitCities({ cityId, cityName })
  //   }
  // }

  // 初始加载数据
  initLoadData() {}
  /**
   * tabs 页面切换触发 的事件
   * @param key
   */
  handleTabChange(key) {
    this.setState({
      activeTab: key
    })
  }

  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: '',
        name: '住宅基础数据'
      },
      {
        key: 3,
        path: '',
        name: '数据导出'
      }
    ]

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  render() {
    const { activeTab, cityId, cityName } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          <Tabs activeKey={activeTab} onChange={this.handleTabChange}>
            <TabPane tab="楼盘" key="2">
              <BuildingZoneSelected
                options={areaData}
                cityId={cityId}
                cityName={cityName}
                history={this.props.history}
                updateVisitCities={this.props.updateVisitCities}
              />
            </TabPane>
            <TabPane tab="楼栋" key="1">
              <BuildingSelected
                options={buildingData}
                cityId={cityId}
                history={this.props.history}
              />
            </TabPane>
            <TabPane tab="房号" key="3">
              <RoomNum
                options={roomData}
                cityId={cityId}
                history={this.props.history}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}

export default SelfDefinedExport
