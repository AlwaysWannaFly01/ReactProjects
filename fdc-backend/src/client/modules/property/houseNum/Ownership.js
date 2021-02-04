import React, { Component } from 'react'
import { compose } from 'redux'
import Immutable from 'immutable'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Table } from 'antd'
import { Link } from 'react-router-dom'

import router from 'client/router'
import fillupFloor from 'client/utils/fillupFloor'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

// 数据权属
class Ownership extends Component {
  static propTypes = {
    dataList: PropTypes.array.isRequired,
    houseTitle: PropTypes.array.isRequired,
    getDataList: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    buildId: PropTypes.string.isRequired,
    cityId: PropTypes.string.isRequired,
    cityName: PropTypes.string.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      houseNameTitle: [
        {
          title: '物理层',
          dataIndex: 'floorNo',
          width: 80
        },
        {
          title: '实际层',
          dataIndex: 'actualFloor',
          width: 80
        }
      ]
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')

    const qry = {
      cityId: this.cityId,
      buildingId: this.props.buildId,
      fieldName: 'ownership'
    }
    this.props.getDataList(qry)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.dataList !== nextProps.dataList) {
      const { houseTitle, dataList } = nextProps
      const houseNameTitle = []
      houseTitle.forEach(item => {
        const itemArr = item.split(',')
        if (itemArr.length === 2) {
          const title = itemArr.join('')
          houseNameTitle.push({
            title,
            width: 100,
            render: record => {
              const { projectId, buildId, cityId, cityName } = this.props // eslint-disable-line

              if (record[title]) {
                const [houseId, ownership] = record[title].split(',')

                return (
                  <Link
                    to={{
                      pathname: router.RES_HOUSE_NUM_EDIT,
                      search: `projectId=${projectId}&buildId=${buildId}&houseId=${houseId ||
                        ''}&cityId=${cityId}&cityName=${cityName}`
                    }}
                  >
                    {ownership ? (
                      <span>{ownership}</span>
                    ) : (
                      <span style={{ textDecoration: 'underline' }}>——</span>
                    )}
                  </Link>
                )
              }
              return null
            }
          })
        }
      })
      const newDataList = fillupFloor(dataList)
      this.setState({
        houseNameTitle: [...this.state.houseNameTitle, ...houseNameTitle],
        dataList: newDataList
      })
    }
  }

  render() {
    const { houseNameTitle = [], dataList } = this.state

    let x = 120
    if (houseNameTitle.length) {
      x = 100 * houseNameTitle.length
      x += 120
    }

    return (
      <div>
        <Table
          columns={houseNameTitle}
          dataSource={dataList}
          pagination={false}
          loading={this.context.loading.includes(actions.GET_DATA_LIST)}
          scroll={{ x, y: 400 }}
        />
      </div>
    )
  }
}

export default compose(
  connect(
    modelSelector,
    containerActions
  )
)(Ownership)
