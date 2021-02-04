/**
 * @author YJF
 * @description 数据追踪组件
 * @param { url, code }
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Popover, Timeline, Spin } from 'antd'

import * as dataTrackApi from 'client/api/dataTrack.api'

const TimelineItem = Timeline.Item

// const handletype = {
//   1: '新增',
//   2: '更改',
//   3: '删除'
// }

// const colorType = {
//   1: '#108ee9',
//   2: '#87d068'
// }

// 数据追踪URL
const urlObj = {
  baseInfo: '/fdc/data/tracking/logs/project',
  buildInfo: '/fdc/data/tracking/logs/building',
  houseInfo: '/fdc/data/tracking/logs/house'
}

class DataTrackComp extends Component {
  static propTypes = {
    qryId: PropTypes.string.isRequired,
    fromURL: PropTypes.string.isRequired,
    field: PropTypes.number.isRequired,
    qryCont: PropTypes.string
  }

  constructor(props) {
    super(props)

    this.state = {
      dataLoading: false,

      trackData: []
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
  }

  // 获取追踪数据
  async getDataTrack(qryData) {
    try {
      const { data } = await dataTrackApi.getDataTrack(qryData)
      this.setState({
        trackData: data || [],
        dataLoading: false
      })
    } catch (err) {
      this.setState({
        dataLoading: false
      })
      console.log(err)
    }
  }

  handleProjectDataTrace = field => {
    const { qryId, fromURL } = this.props
    this.setState({
      dataLoading: true
    })
    const qryData = {
      cityId: this.cityId,
      field,
      url: urlObj[fromURL]
    }
    switch (fromURL) {
      case 'baseInfo':
        qryData.projectId = qryId
        break
      case 'buildInfo':
        qryData.buildingId = qryId
        break
      case 'houseInfo':
        qryData.houseId = qryId
        break
      default:
        break
    }
    this.getDataTrack(qryData)
  }

  render() {
    const { trackData, dataLoading } = this.state

    const content = (
      <Spin spinning={dataLoading}>
        {trackData.length > 0 ? (
          <Timeline
            style={{
              minWidth: 200,
              maxWidth: 300,
              maxHeight: 450,
              overflow: 'auto'
            }}
          >
            {trackData.map(item => (
              <TimelineItem key={item.id} style={{ marginTop: 6 }}>
                <div>
                  {item.dataDate || '暂无'} {item.dataTime}
                  {/* <span style={{ float: 'right' }}>
                    <Tag
                      color={colorType[item.operationType]}
                      style={{ cursor: 'auto' }}
                    >
                      {handletype[item.operationType]}
                    </Tag>
                  </span> */}
                </div>
                <p>
                  {item.operationType === 1 ? item.creator : item.modifier}
                  &nbsp;&nbsp;
                  {item.content}
                </p>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          '暂无记录'
        )}
      </Spin>
    )

    return (
      <Popover
        placement="rightTop"
        title="记录"
        content={content}
        trigger="click"
      >
        <a onClick={() => this.handleProjectDataTrace(this.props.field)}>
          {this.props.qryCont || '数据追踪'}
        </a>
      </Popover>
    )
  }
}

export default DataTrackComp
