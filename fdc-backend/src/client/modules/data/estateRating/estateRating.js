import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import {
  Table,
  Breadcrumb,
  Icon,
  Form,
  Row,
  Col,
  Button,
  Modal,
  message,
  Message,
  Input
} from 'antd'
// import { parse } from 'qs'
import moment from 'moment'
import { Link } from 'react-router-dom'
import layout from 'client/utils/layout'
import CityRange from 'client/components/city-range'
import showTotal from 'client/utils/showTotal'
import router from 'client/router'

import actions, { containerActions } from './actions'
import EstateRatingEdit from './EstateRating.edit'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './estateRating.less'
// import AreaRentalEdit from './AreaRental.edit'

const FormItem = Form.Item
const confirm = Modal.confirm

/**
 * @description 数据统计-楼盘评级规则模块
 */
class EstateRating extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getRatingRuleSearch: PropTypes.func.isRequired,
    ratingRlueList: PropTypes.array.isRequired,
    cityList: PropTypes.instanceOf(Immutable.List).isRequired,
    getAreaList: PropTypes.func.isRequired, // 行政区
    getLoopLine: PropTypes.func.isRequired, // 环线
    exportGradeRules: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      exportLoading: false,
      // 城市范围
      cityValues: [],
      modalVisible: false,
      keyword: '',
      editDate: {},
      newAreaList: []
    }
  }

  componentDidMount() {
    this.cityId = sessionStorage.getItem('FDC_CITY')
    const params = {
      pageNum: 1,
      pageSize: 20
    }
    this.props.getRatingRuleSearch(params)
  }

  disabledDate = current => (current > moment().endOf('month'))

  // 城市范围变更事件
  // value.length > 1 则重置行政区和片区
  // value.item长度为2:省份 3.城市
  handleCityRangeChange = value => {
    // console.log(value, '城市范围变更')
    this.setState({
      cityValues: value
    })
    if (value.length === 1) {
      const valueArr = value[0].split('-')
      let cityId = []// eslint-disable-line no-unused-vars
      // 省份
      if (valueArr.length === 2) {
        const [provinceId] = valueArr
        const cityList = this.props.cityList.filter(
          item => item.get('provinceId') === +provinceId
        )
        if (cityList.size === 1) {
          cityId = cityList.get(0).get('id')
        }
      }
      // 城市
      if (valueArr.length === 3) {
        const [, realCityId] = valueArr
        cityId = realCityId
      }
    }
  }

  handleFindAllCityIds = cityValues => {
    const cityIds = []
    if (cityValues instanceof Array) {
      cityValues.forEach(item => {
        const itemArr = item ? item.split('-') : []
        if (itemArr.length === 2) {
          const provinceId = itemArr[0]
          this.props.cityList.forEach(item => {
            if (item.get('provinceId') === +provinceId) {
              cityIds.push(item.get('id'))
            }
          })
        }
        if (itemArr.length === 3) {
          cityIds.push(itemArr[1])
        }
      })
    }
    return cityIds
  }

  // 处理查询数据
  handlePreSubmitData = pageNum => {
    const { cityValues } = this.state
    const { keyword } = this.props.form.getFieldsValue()
    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      cityIds: this.handleFindAllCityIds(cityValues).join(','),
      keyword: keyword ? keyword.trim() : ''
    }
    return params
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    const { cityValues } = this.state
    const { keyword } = this.props.form.getFieldsValue()
    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      cityIds: this.handleFindAllCityIds(cityValues).join(','),
      keyword: keyword ? keyword.trim() : ''
    }
    this.props.getRatingRuleSearch(params)
  }

  exportEstateRating = () => {
    const params = this.handlePreSubmitData()
    const that = this
    this.props.exportGradeRules(params, res => {
      console.log(res)
      const { code, message } = res
      if (+code === 200) {
        confirm({
          title: '导出提示',
          content: (
            <div>
              <p>系统正在导出Excel,请耐心等待...</p>
              <p>
                <Icon type="info-circle" />
                <i style={{ marginLeft: 8 }} />
                可跳转导出任务页查看
              </p>
            </div>
          ),
          okText: '跳转',
          onOk() {
            that.goExportTask()
          },
          onCancel() {}
        })
      } else {
        Message.error(message)
      }
    })
  }

  goExportTask = () => {
    if (pagePermission('fdc:ds:export:check')) {
      this.props.history.push({
        pathname: router.DATA_EXPORT_TASK,
        search: 'type=2'
      })
    } else {
      message.warning('没有导出任务页权限，请联系管理员')
    }
  }
  // 点击了更改规则按钮
  handChangeRating = record => {
    // locationType   0-环线，1-行政区
    if (record.locationType === 1) {
      this.props.getAreaList(record.cityId, res => {
        const { code, data, message } = res
        const newAreaList = data.map(({ id, areaName }) => ({
          key: id,
          label: areaName,
          value: `${id}`,
          disable: false
        }))
        if (+code === 200) {
          this.setState({
            modalVisible: true,
            editDate: record,
            newAreaList
          })
        } else {
          Message.error(message)
        }
      })
    } else {
      this.props.getLoopLine(res => {
        const { code, data, message } = res
        const newAreaList = data.map(({ code, name }) => ({
          key: code,
          label: name,
          value: `${code}`,
          disable: false
        }))
        console.log(res)
        if (+code === 200) {
          console.log(record)
          this.setState({
            modalVisible: true,
            editDate: record,
            newAreaList
          })
        } else {
          Message.error(message)
        }
      })
    }
  }

  handleCloseModal = () => {
    this.setState({
      modalVisible: false
    })
  }

  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '楼盘评级规则',
        icon: 'appstore'
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

  renderForm() {
    const { getFieldDecorator } = this.props.form
    const { exportLoading, cityValues, keyword } = this.state
    // 物业类型
    return (
      <Form style={{ marginTop: 8 }} onSubmit={e => this.handleSearch(e, 1)}>
        <Row>
          <Col span={12}>
            <FormItem
              label="城市范围"
              labelCol={layout(6, 6)}
              wrapperCol={layout(6, 18)}
              style={{ marginBottom: 4 }}
            >
              {getFieldDecorator('cities', {
                initialValue: cityValues
              })(<CityRange onCityRangeChange={this.handleCityRangeChange} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={9}>
            <FormItem
              label="关键字"
              labelCol={layout(6, 8)}
              wrapperCol={layout(6, 16)}
            >
              {getFieldDecorator('keyword', {
                initialValue: keyword
              })(<Input placeholder="请输入关键字" maxLength={100} />)}
            </FormItem>
          </Col>
          <Col span={3}>
            <Button
              style={{ marginLeft: 58, marginTop: 4 }}
              type="primary"
              onClick={e => this.handleSearch(e, 1)}
              icon="search"
            >
              查询
            </Button>
          </Col>
        </Row>
        <Row style={{ marginBottom: 16 }}>
          <Link
            to={{
              pathname: router.DATA_ESTATE_RATING_IMPORT,
              search: `importType=${1212132}&cityId=${this.cityId}`
            }}
          >
            {pagePermission('fdc:ds:ratingRules:import') ? (
              <Button type="primary" icon="upload" style={{ marginRight: 16 }}>
                导入
              </Button>
            ) : (
              ''
            )}
          </Link>
          {pagePermission('fdc:ds:ratingRules:export') ? (
            <Button
              type="primary"
              icon="download"
              onClick={this.exportEstateRating}
              loading={exportLoading}
            >
              导出
            </Button>
          ) : (
            ''
          )}
        </Row>
      </Form>
    )
  }

  renderTable() {
    /* eslint-disable */
    const { ratingRlueList } = this.props
    const columns = [
      {
        title: '省份',
        dataIndex: 'provinceName',
        width: 120,
        fixed: 'left',
      },
      {
        title: '城市',
        dataIndex: 'cityName',
        width: 150,
        fixed: 'left',
      },
      {
        title: '报盘活跃度权重（%）',
        dataIndex: 'offerLivenessWeight',
        width: 200,
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: 'VQ查询热度权重（%）',
        dataIndex: 'vqQueryWeight',
        width: 230,
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '竣工日期权重（%）',
        dataIndex: 'deliveryDateWeight',
        width: 200,
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '开发商权重（%）',
        width: 200,
        dataIndex: 'developerWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '楼盘体量权重（%）',
        width: 200,
        dataIndex: 'volumeWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '内部配套权重（%）',
        width: 200,
        dataIndex: 'facilitiesWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '物业权重（%）',
        width: 150,
        dataIndex: 'managementWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '交通权重（%）',
        width: 150,
        dataIndex: 'transportationWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '市政权重（%）',
        width: 150,
        dataIndex: 'municipalityWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '医疗权重（%）',
        width: 150,
        dataIndex: 'medicalWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '教育权重（%）',
        width: 150,
        dataIndex: 'educationWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '商业权重（%）',
        width: 150,
        dataIndex: 'commercialWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '租售比（%）',
        width: 142,
        dataIndex: 'priceRentRatioWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '价格稳定性（%）',
        width: 142,
        dataIndex: 'priceStabilityWeight',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      // {
      //   title: '入围银行白名单权重（%）',
      //   width: 220,
      //   dataIndex: 'bankWhitelistWeight',
      //   render: r => <span>{r || r===0?r:'——'}</span>
      // },
      {
        title: '修改人',
        width: 150,
        dataIndex: 'modifier',
        render: r => <span>{r || r===0?r:'——'}</span>
      },
      {
        title: '修改时间',
        width: 200,
        dataIndex: 'modTime',
        render: date => {
          if (!date) return '——'
          return moment(date).format('YYYY-MM-DD HH:mm:ss')
        },
      },
      {
        title: '',
        width: '',
        fixed: 'right',
      },
      {
        title: '操作',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Fragment>
            {pagePermission('fdc:ds:ratingRules:change') ? (
              <Button
                type="primary"
                onClick={() => this.handChangeRating(record)}
              >
                更改规则
              </Button>
            ) : (
              <Button type="primary" disabled>
                更改规则
              </Button>
            )}
          </Fragment>
        )
        // dataIndex: 'projectId'
      },
      {
        title: '' //此处添加一个空列，让此列去自适应一行宽度
      }
    ]

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

    return (
      <Table
        rowKey="key"
        pagination={pagination}
        columns={columns}
        dataSource={ratingRlueList}
        loading={this.context.loading.includes(actions.GET_RATING_RULE_SEARCH)}
        scroll={{ x: 3100, y: 420 }}
        className={styles.defineTable}
      />
    )
  }

  render() {
    const { modalVisible, editDate, newAreaList } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderForm()}
          {this.renderTable()}
        </div>
        <EstateRatingEdit
          visible={modalVisible}
          onCloseModal={this.handleCloseModal}
          onSearch={this.handleSearch}
          editDate={editDate}
          newAreaList={newAreaList}
        />
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
)(EstateRating)
