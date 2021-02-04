import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  Form,
  Table,
  Row,
  Col,
  Button,
  Message,
  Alert,
  InputNumber
} from 'antd'
import Immutable from 'immutable'
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

// 价格系数
class StandardRate extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    dataList: PropTypes.array.isRequired,
    houseTitle: PropTypes.array.isRequired,
    getDataList: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    buildId: PropTypes.string.isRequired,
    getHouseAvgprice: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    updateHouseCols: PropTypes.func.isRequired,
    buildStatus: PropTypes.number.isRequired,
    calculateHousePrice: PropTypes.func.isRequired,
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
    this.getHouseAvgprice()
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
            width: 160,
            render: record => {
              const { projectId, buildId, cityId, cityName } = this.props // eslint-disable-line

              if (record[title]) {
                const [houseId, price] = record[title].split(',')

                // 房号是否有 价格系数 / VQ价格系数
                // let isPrice = false
                // if (price !== '' || vqPrice !== '') {
                //   isPrice = true
                // }
                return (
                  <Link
                    to={{
                      pathname: router.RES_HOUSE_NUM_EDIT,
                      search: `projectId=${projectId}&buildId=${buildId}&houseId=${houseId ||
                        ''}&cityId=${cityId}&cityName=${cityName}`
                    }}
                  >
                    {price ? (
                      <span>{price}</span>
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
    const { buildId } = this.props
    const qry = {
      cityId: this.cityId,
      buildingId: buildId,
      fieldName: 'standardRate'
    }
    this.props.getDataList(qry)
  }

  getHouseAvgprice = () => {
    const { projectId, buildId } = this.props
    const avgQry = {
      cityId: this.cityId,
      projectId,
      buildingId: buildId
    }
    this.props.getHouseAvgprice(avgQry)
  }

  handleSetPrice = () => {
    const {
      postData,
      isChosedHouseFloor
    } = this.houseFloorRef.handleSubmitHouseFloor()
    // 如果有选值
    if (isChosedHouseFloor) {
      // console.log(postData, 1111)
      const { floorNo, houseCol } = postData
      const { standardRate } = this.props.form.getFieldsValue()
      // console.log(standardRate)
      if (standardRate) {
        const data = {
          cityId: this.cityId,
          buildingId: this.props.buildId,
          fieldName: 'standardRate',
          fieldValue: standardRate,
          floorList: floorNo,
          unitNoList: houseCol
        }
        this.props.updateHouseCols(data, res => {
          Message.success(`${res || 0}`)
          this.getDataList()
          this.getHouseAvgprice()
        })
      } else {
        Message.info('请输入价格系数')
      }
    } else {
      Message.info('请选择物理层/单元室号')
    }
  }

  handleCalculateHousePrice = () => {
    const houseAvgPrice = this.props.model.get('houseAvgPrice')
    const { projectPrice } = houseAvgPrice

    const calculateArr = []
    this.state.dataList.forEach(item => {
      const itemArr = Object.keys(item)
      const extrKeys = ['actualFloor', 'floorNo', 'isAddFloor', 'key']
      itemArr.forEach(key => {
        if (!extrKeys.includes(key)) {
          if (item[key]) {
            calculateArr.push(`${item[key].split(',')[0]},${projectPrice || 0}`)
          }
        }
      })
    })
    const params = {
      cityId: this.cityId,
      calculateParam: calculateArr
    }
    this.props.calculateHousePrice(params, res => {
      // console.log(res, 11)
      const { code, succMsg } = res
      if (code === 200) {
        Message.info(succMsg)
        this.getDataList()
        this.getHouseAvgprice()
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const { houseNameTitle = [], dataList = [] } = this.state

    const houseAvgPrice = this.props.model.get('houseAvgPrice')

    let x = 120
    if (houseNameTitle.length) {
      x = 160 * houseNameTitle.length
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
        <div>
          <Row style={{ marginTop: 16, marginBottom: 16 }}>
            <Alert
              style={{ minHeight: 40, paddingBottom: 0 }}
              message={
                <p>
                  项目均价{' '}
                  <span style={{ fontWeight: 600, color: '#33CABB' }}>
                    {houseAvgPrice.get('projectPrice') || 0}
                  </span>
                  &nbsp;&nbsp; 楼栋均价{' '}
                  <span style={{ fontWeight: 600, color: '#33CABB' }}>
                    {houseAvgPrice.get('buildingPrice') || 0}
                  </span>
                </p>
              }
              type="info"
              showIcon
            />
          </Row>
          {this.props.buildStatus === 1 ? (
            <div style={{ marginTop: 8 }}>
              <HouseFloor onHouseFloorRef={this.onHouseFloorRef} />
              {pagePermission('fdc:hd:residence:base:roomNum:change') ? (
                <Form>
                  <Row>
                    <Col span={16}>
                      <FormItem
                        label="标准系数"
                        labelCol={layout(12, 6)}
                        wrapperCol={layout(12, 18)}
                      >
                        <Col span={10}>
                          <FormItem>
                            {getFieldDecorator('standardRate')(
                              <InputNumber
                                min={0.5}
                                max={3}
                                precision={4}
                                placeholder="标准系数"
                                style={{ width: '100%' }}
                              />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={2} />
                        <Col span={12}>
                          <FormItem>
                            <Button
                              style={{ marginRight: 16 }}
                              type="primary"
                              onClick={this.handleSetPrice}
                            >
                              设置
                            </Button>
                          </FormItem>
                        </Col>
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              ) : (
                ''
              )}
            </div>
          ) : null}
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
)(StandardRate)
