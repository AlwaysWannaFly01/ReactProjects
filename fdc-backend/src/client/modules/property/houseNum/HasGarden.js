import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import PropTypes from 'prop-types'
import { Form, Table, Row, Select, Col, Message, Button } from 'antd'
import { Link } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import layout from 'client/utils/layout'
import router from 'client/router'
import shallowEqual from 'client/utils/shallowEqual'
import fillupFloor from 'client/utils/fillupFloor'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import HouseFloor from './HouseFloor'

const FormItem = Form.Item
const { Option } = Select

// 有无花园
class HasGarden extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    dataList: PropTypes.array.isRequired,
    houseTitle: PropTypes.array.isRequired,
    getDataList: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    buildId: PropTypes.string.isRequired,
    updateHouseCols: PropTypes.func.isRequired,
    buildStatus: PropTypes.number.isRequired,
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
      ],
      // 是否已加载title
      isShowTitle: false
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')

    this.getDataList()
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(this.props.dataList, nextProps.dataList)) {
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
                const [houseId, hasGarden] = record[title].split(',')

                return (
                  <Link
                    to={{
                      pathname: router.RES_HOUSE_NUM_EDIT,
                      search: `projectId=${projectId}&buildId=${buildId}&houseId=${houseId ||
                        ''}&cityId=${cityId}&cityName=${cityName}`
                    }}
                  >
                    {hasGarden ? (
                      <span>{hasGarden === '1' ? '是' : '否'}</span>
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

      if (this.state.isShowTitle) {
        this.setState({
          dataList: newDataList
        })
      } else {
        this.setState({
          houseNameTitle: [...this.state.houseNameTitle, ...houseNameTitle],
          dataList: newDataList,
          isShowTitle: true
        })
      }
    }
  }

  onHouseFloorRef = ref => {
    this.houseFloorRef = ref
  }

  getDataList = () => {
    const qry = {
      cityId: this.cityId,
      buildingId: this.props.buildId,
      fieldName: 'hasGarden'
    }
    this.props.getDataList(qry)
  }

  handleSet = () => {
    const {
      postData,
      isChosedHouseFloor
    } = this.houseFloorRef.handleSubmitHouseFloor()
    // 如果有选值
    if (isChosedHouseFloor) {
      const { floorNo, houseCol } = postData
      const { hasGarden } = this.props.form.getFieldsValue()
      if (hasGarden) {
        const data = {
          cityId: this.cityId,
          buildingId: this.props.buildId,
          fieldName: 'hasGarden',
          fieldValue: hasGarden,
          floorList: floorNo,
          unitNoList: houseCol
        }
        this.props.updateHouseCols(data, res => {
          Message.success(`${res || 0}`)
          this.getDataList()
        })
      } else {
        Message.info('请选择是否有花园')
      }
    } else {
      Message.info('请选择物理层/单元室号')
    }
  }

  render() {
    const { houseNameTitle = [], dataList } = this.state

    const { getFieldDecorator } = this.props.form

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
        {this.props.buildStatus === 1 ? (
          <div>
            <Row style={{ marginTop: 16 }}>
              <HouseFloor onHouseFloorRef={this.onHouseFloorRef} />
            </Row>
            {pagePermission('fdc:hd:residence:base:roomNum:change') ? (
              <Row>
                <Col span={16}>
                  <FormItem
                    label="是否带花园"
                    labelCol={layout(12, 6)}
                    wrapperCol={layout(12, 18)}
                  >
                    <Col span={10}>
                      <FormItem>
                        {getFieldDecorator('hasGarden')(
                          <Select
                            placeholder="请选择"
                            style={{ width: '100%' }}
                          >
                            <Option value="1">是</Option>
                            <Option value="0">否</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={2} />
                    <Col span={12}>
                      <FormItem>
                        <Button
                          style={{ marginRight: 16 }}
                          type="primary"
                          onClick={this.handleSet}
                        >
                          设置
                        </Button>
                      </FormItem>
                    </Col>
                  </FormItem>
                </Col>
              </Row>
            ) : (
              ''
            )}
          </div>
        ) : null}
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
)(HasGarden)
