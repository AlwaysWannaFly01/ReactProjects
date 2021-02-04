import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {
  Breadcrumb,
  Icon,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  InputNumber,
  Message,
  Switch
} from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import router from 'client/router'
// import compareObj from 'client/utils/compareObj'
import DataTrackComp from 'client/components/data-track2'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './HouseNum.less'

const FormItem = Form.Item
const { TextArea } = Input
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    xs: { span: 6 },
    sm: { span: 8 }
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 14 }
  }
}

const whetherType = [
  {
    label: '是',
    value: '1'
  },
  {
    label: '否',
    value: '0'
  },
  {
    label: undefined,
    value: '-1'
  }
]

/**
 * 房号 新增 / 编辑
 * 带 houseId 则为编辑
 * author: YJF
 */
class HouseNameEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getHouseDict: PropTypes.func.isRequired,
    getBuildDetail: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    getHouseDetail: PropTypes.func.isRequired,
    addHouseNum: PropTypes.func.isRequired,
    editHouseNum: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    buildStatus: PropTypes.number.isRequired,
    deleteHouseNum: PropTypes.func.isRequired,
    getDataList: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    const {
      projectId = '',
      buildId = '',
      houseId = '',
      cityId = '',
      cityName
    } = parse(props.location.search.substr(1))

    this.state = {
      projectId,
      buildId,
      houseId,

      // 是否手动输入的房号名称
      isHouseNameInput: !!houseId,
      isOnPropertyShow: false,
      tempSubHouseList:{},
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        // 获取数据字典合集
        this.props.getHouseDict()
        // 获取楼栋详情
        this.getBuildDetail()
        // 获取楼盘详情 定制面包屑需要
        this.props.getProjectDetail(this.state.projectId, this.cityId)
        // 如果有houseId, 则获取房号详情
        if (this.state.houseId) {
          const params = {
            cityId: this.cityId,
            id: this.state.houseId
          }
          // this.props.getHouseDetail(params)
          this.props.getHouseDetail(params, houseDetail => {
            this.setState({
              isOnPropertyShow: !!houseDetail.subHouseType
            })
          })
        }
        this.getDataList()
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  onChangeSubHouseType = value => {
    let hasSave = false
    this.setState({ isOnPropertyShow: !!value })
    let {isOnProperty,subHouseArea,subHouseType} = this.props.form.getFieldsValue()
    let tempSubHouseList = this.state.tempSubHouseList
    if(subHouseType){
      tempSubHouseList[subHouseType]={
        subHouseType:subHouseType,
        isOnProperty:isOnProperty,
        subHouseArea:subHouseArea
      }
      if(isOnProperty||subHouseArea){
        this.setState({
          tempSubHouseList:tempSubHouseList
        })
      }
    }
    this.props.form.setFieldsValue({ isOnProperty: '', subHouseArea: '' })
    for(let i in tempSubHouseList){
      if(i === value){
        hasSave = true
        this.props.form.setFieldsValue({ isOnProperty: tempSubHouseList[i].isOnProperty, subHouseArea: tempSubHouseList[i].subHouseArea})
      }
    }
  }

  getDataList = () => {
    const qry = {
      cityId: this.cityId,
      buildingId: this.state.buildId,
      fieldName: 'houseName'
    }
    this.props.getDataList(qry)
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

  // 将 select value值转为string供UI渲染 如果是1/0
  formatString = value => {
    let valueString
    if (value) {
      valueString = `${value}`
    }
    if (value === 0) {
      valueString = `${value}`
    }
    return valueString
  }

  handleSubmit = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values.houseName = values.houseName.trim()

        const { buildId, houseId } = this.state
        values.isLocked = values.isLocked ? 1 : 0

        const { projectDetail } = this.props.model
        const { id } = projectDetail
        const { cityId, cityName } = this.state

        if (houseId) {
          // console.log(values, '编辑')
          // 去左右空格
          // values.unitNo = values.unitNo ? values.unitNo.trim() : undefined
          // values.roomNum = values.roomNum.trim()
          values.unitNo = values.unitNoRoomNum.split(',')[0]
          values.roomNum = values.unitNoRoomNum.split(',')[1]
          delete values.unitNoRoomNum
          values.actualFloor = values.actualFloor
            ? values.actualFloor.trim()
            : undefined

          // const { houseDetail } = this.props.model
          // const oldDataObj = houseDetail.toJS()
          // const newDataObj = compareObj(oldDataObj, values)

          const newDataObj = Object.assign({}, values)

          newDataObj.id = houseId
          newDataObj.cityId = this.cityId
          newDataObj.buildingId = buildId
          this.props.editHouseNum(newDataObj, res => {
            const { code, message } = res || {}
            // const { projectDetail } = this.props.model
            // const { id } = projectDetail
            // const { cityId, cityName } = this.state
            if (+code === 200) {
              // this.props.history.goBack() // 修改因为新增标签页之后，不能返回到上一个页面
              this.context.router.history.push({
                pathname: router.RES_HOUSE_NUM,
                search: `projectId=${id}&buildId=${buildId}&cityId=${cityId}&cityName=${cityName}`
              })
              Message.success('编辑成功')
            } else {
              Message.error(message)
            }
          })
        } else {
          // console.log(values, '新增')
          values.unitNo = values.unitNoRoomNum.split(',')[0]
          values.roomNum = values.unitNoRoomNum.split(',')[1]
          delete values.unitNoRoomNum
          values.actualFloor = values.actualFloor
            ? values.actualFloor.trim()
            : undefined

          values.cityId = this.cityId
          values.buildingId = buildId
          this.props.addHouseNum(values, res => {
            const { code, message } = res || {}
            if (+code === 200) {
              // this.props.history.goBack()
              this.context.router.history.push({
                pathname: router.RES_HOUSE_NUM,
                search: `projectId=${id}&buildId=${buildId}&cityId=${cityId}&cityName=${cityName}`
              })
              Message.success('新增成功')
            } else {
              Message.error(message)
            }
          })
        }
      }
    })
  }

  handleDel = () => {
    const delParams = {
      cityId: this.cityId,
      ids: this.state.houseId
    }
    this.props.deleteHouseNum(delParams, () => {
      Message.success('删除成功！')
      this.props.history.goBack()
    })
  }

  handleHouseNameInput = e => {
    const houseName = e.target.value
    // 判断手动输入,则不再接收 单元室号 + 物理楼层 变更值
    this.setState({
      isHouseNameInput: !!houseName
    })
  }

  // 物理层 & 实际层: 当有物理层和实际层时候，以实际层拼接
  handleChangeName = () => {
    const { isHouseNameInput } = this.state
    setTimeout(() => {
      if (!isHouseNameInput) {
        const {
          unitNoRoomNum = '',
          floorNo = '',
          actualFloor = ''
        } = this.props.form.getFieldsValue([
          'houseName',
          'unitNoRoomNum',
          'floorNo',
          'actualFloor'
        ])
        // console.log(floorNo, actualFloor, unitNoRoomNum)
        let unitNo = ''
        let roomNum = ''
        if (unitNoRoomNum) {
          unitNo = unitNoRoomNum.split(',')[0]
          roomNum = unitNoRoomNum.split(',')[1]
        }
        if (actualFloor !== null && actualFloor !== '') {
          this.props.form.setFieldsValue({
            houseName: `${unitNo}${actualFloor.trim()}${roomNum}`
          })
        } else {
          this.props.form.setFieldsValue({
            houseName: `${unitNo}${floorNo}${roomNum}`
          })
        }
      }
    }, 100)
  }

  renderBreads() {
    /* eslint-disable */
    const { projectDetail, buildDetail, houseDetail } = this.props.model
    const { areaId, areaName, id, projectName, sysStatus } = projectDetail
    const { buildingName } = buildDetail
    const { buildId, houseId, cityId, cityName } = this.state
    let houseName
    if (houseId) {
      houseName = houseDetail.get('houseName')
      houseName =
        houseName && houseName.length > 10
          ? `${houseName.substr(0, 10)}...`
          : houseName
    }

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
        search: `projectId=${id}&buildId=${buildId}&cityId=${cityId}&cityName=${cityName}`
      },
      {
        key: 7,
        path: router.RES_HOUSE_NUM,
        name: '房号列表',
        search: `projectId=${id}&buildId=${buildId}&cityId=${cityId}&cityName=${cityName}`
      }
    ]

    if (houseId) {
      breadList.push({
        key: 8,
        path: '',
        name: houseName
      })
    } else {
      breadList.push({
        key: 8,
        path: '',
        name: '房号新增'
      })
    }

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

  renderForm() {
    const {
      form: { getFieldDecorator },
      buildStatus
    } = this.props

    const { houseDict, houseDetail, floorList, houseColList } = this.props.model
    const {
      decorationType = [],
      houseType = [],
      noiseType = [],
      orientationType = [],
      sightType = [],
      structureType = [],
      subHouseType = [],
      usage = [],
      ventLightType = []
    } = houseDict

    // 对物理层进行补齐处理
    const newFloorList = []
    if (floorList.length > 0) {
      const len = floorList.length
      const minFloorNo = floorList[0]
      const maxFloorNo = floorList[len - 1]

      if (minFloorNo > 0) {
        for (let i = 1; i <= maxFloorNo; i += 1) {
          newFloorList.push(i)
        }
      } else if (minFloorNo < 0 && maxFloorNo > 0) {
        for (let i = minFloorNo; i <= maxFloorNo; i += 1) {
          // 去除0层
          if (i !== 0) {
            newFloorList.push(i)
          }
        }
      } else if (maxFloorNo < 0) {
        for (let i = minFloorNo; i < 0; i += 1) {
          newFloorList.push(i)
        }
      }
    }
    const { houseId, isOnPropertyShow } = this.state
    let unitNoRoomNum
    if (houseId) {
      const { unitNo, roomNum } = houseDetail
      if (unitNo) {
        unitNoRoomNum = `${unitNo},${roomNum}`
      } else {
        unitNoRoomNum = roomNum ? `,${roomNum}` : undefined
      }
    }

    return (
      <Form onSubmit={this.handleSubmit}>
        {houseId ? (
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label="房号数据权属">
                {getFieldDecorator('ownership', {
                  initialValue: houseId
                    ? houseDetail.get('ownership')
                    : undefined
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        ) : null}
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="房号名称">
              {getFieldDecorator('houseName', {
                rules: [
                  {
                    required: true,
                    message: '房号名称不能为空'
                  },
                  {
                    whitespace: true,
                    message: '房号名称不能为空'
                  },
                  {
                    max: 30,
                    message: '最大长度30'
                  }
                ],
                initialValue: houseId ? houseDetail.get('houseName') : undefined
              })(
                <Input
                  // maxLength={30}
                  placeholder="请输入房号名称"
                  onBlur={this.handleHouseNameInput}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1001}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
          <Col span={2}>
            <FormItem>
              {getFieldDecorator('isLocked', {
                valuePropName: 'checked',
                initialValue: houseId
                  ? houseDetail.get('isLocked') === 1
                  : false
              })(
                <Switch
                  disabled={
                    buildStatus === 0 ||
                    !pagePermission('fdc:hd:residence:base:roomNum:change')
                  }
                  checkedChildren={<Icon type="lock" />}
                  unCheckedChildren={<Icon type="unlock" />}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem label="单元室号" {...formItemLayout}>
              {getFieldDecorator('unitNoRoomNum', {
                rules: [
                  {
                    required: true,
                    message: '单元室号不能为空'
                  }
                ],
                onChange: this.handleChangeName,
                initialValue: houseId ? unitNoRoomNum : undefined
              })(
                <Select
                  style={{ width: '100%' }}
                  disabled={Boolean(houseId)}
                  placeholder="请选择"
                >
                  {houseColList.map(item => (
                    <Option key={item}>{item.split(',').join('')}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1002}
                  qryId={houseId}
                  qryCont="单元追踪"
                />
              </FormItem>
            </Col>
          ) : null}
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1003}
                  qryId={houseId}
                  qryCont="室号追踪"
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        {/* <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="单元">
              {getFieldDecorator('unitNo', {
                initialValue: houseId ? houseDetail.get('unitNo') : undefined
              })(
                <Input
                  maxLength={20}
                  placeholder="请输入"
                  disabled={buildStatus === 0}
                  onBlur={this.handleChangeName}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComponent
                  id={houseId}
                  code={1002}
                  url={TRACK_URL}
                  logId="houseId"
                />
              </FormItem>
            </Col>
          ) : null}
          <Col span={8}>
            <FormItem {...formItemLayout} label="室号">
              {getFieldDecorator('roomNum', {
                rules: [
                  {
                    required: true,
                    message: '室号不能为空'
                  },
                  {
                    whitespace: true,
                    message: '室号不能位空'
                  }
                ],
                initialValue: houseId ? houseDetail.get('roomNum') : undefined
              })(
                <Input
                  maxLength={20}
                  placeholder="请输入"
                  disabled={buildStatus === 0}
                  onBlur={this.handleChangeName}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComponent
                  id={houseId}
                  code={1003}
                  url={TRACK_URL}
                  logId="houseId"
                />
              </FormItem>
            </Col>
          ) : null}
        </Row> */}
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="物理层">
              {getFieldDecorator('floorNo', {
                rules: [
                  {
                    required: true,
                    message: '物理层不能为空'
                  }
                ],
                onChange: this.handleChangeName,
                initialValue: houseId ? houseDetail.get('floorNo') : undefined
              })(
                // <InputNumber
                //   disabled={buildStatus === 0}
                //   min={-50}
                //   max={100}
                //   placeholder="请输入"
                //   precision={0}
                //   style={{ width: '100%' }}
                //   onBlur={this.handleChangeName}
                // />
                <Select
                  style={{ width: '100%' }}
                  disabled={Boolean(houseId)}
                  placeholder="请选择"
                >
                  {newFloorList.map(item => (
                    <Option key={item}>{item}</Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1004}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
          <Col span={8}>
            <FormItem {...formItemLayout} label="实际层">
              {getFieldDecorator('actualFloor', {
                rules: [
                  {
                    max: 20,
                    message: '最大长度20'
                  }
                ],
                initialValue: houseId
                  ? houseDetail.get('actualFloor')
                  : undefined
              })(
                <Input
                  disabled={buildStatus === 0}
                  style={{ width: '100%' }}
                  // maxLength={20}
                  placeholder="请输入"
                  onBlur={this.handleChangeName}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1005}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="标准系数">
              {getFieldDecorator('standardRate', {
                initialValue: houseId
                  ? houseDetail.get('standardRate')
                  : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  min={0.5}
                  max={3}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  precision={4}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1030}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
          <Col span={8}>
            <FormItem {...formItemLayout} label="价格系数">
              {getFieldDecorator('priceRate', {
                initialValue: houseId ? houseDetail.get('priceRate') : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  min={0.5}
                  max={3}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  precision={4}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1006}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="VQ价格系数">
              {getFieldDecorator('vqPriceRate', {
                initialValue: houseId
                  ? houseDetail.get('vqPriceRate')
                  : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  min={0.5}
                  max={3}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  precision={4}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1007}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="租金价格系数">
              {getFieldDecorator('rentRate', {
                initialValue: houseId ? houseDetail.get('rentRate') : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  min={0.5}
                  max={2}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  precision={4}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1031}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="建筑面积">
              {getFieldDecorator('houseArea', {
                initialValue: houseId ? houseDetail.get('houseArea') : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  style={{ width: '100%' }}
                  min={0}
                  max={100000}
                  precision={2}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1008}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="面积确认">
              {getFieldDecorator('isAreaConfirmed', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('isAreaConfirmed'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {whetherType.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1009}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="套内面积">
              {getFieldDecorator('houseInternalArea', {
                initialValue: houseId
                  ? houseDetail.get('houseInternalArea')
                  : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  style={{ width: '100%' }}
                  placeholder="请输入"
                  min={0}
                  max={100000}
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1010}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="房屋用途">
              {getFieldDecorator('usageCode', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('usageCode'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {usage.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1011}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="户型">
              {getFieldDecorator('houseTypeCode', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('houseTypeCode'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {houseType.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1012}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="户型结构">
              {getFieldDecorator('structureCode', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('structureCode'))
                  : undefined
              })(
                <Select
                  placeholder="请选择"
                  allowClear
                  disabled={buildStatus === 0}
                >
                  {structureType.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1013}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="朝向">
              {getFieldDecorator('orientationCode', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('orientationCode'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {orientationType.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1014}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="景观">
              {getFieldDecorator('sightCode', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('sightCode'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {sightType.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1015}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="通风采光">
              {getFieldDecorator('ventLightCode', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('ventLightCode'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {ventLightType.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1016}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="噪音情况">
              {getFieldDecorator('noiseCode', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('noiseCode'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {noiseType.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1017}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="装修">
              {getFieldDecorator('decorationCode', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('decorationCode'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {decorationType.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1018}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="附属房屋类型">
              {getFieldDecorator('subHouseType', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('subHouseType'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={this.onChangeSubHouseType}
                >
                  {subHouseType.map(option => (
                    <Option key={option.get('code')} value={option.get('code')}>
                      {option.get('name')}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1019}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="是否证载">
              {getFieldDecorator('isOnProperty', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('isOnProperty'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0 || !isOnPropertyShow}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  maxTagCount={3}
                >
                  {whetherType.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1029}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="附属房屋面积">
              {getFieldDecorator('subHouseArea', {
                initialValue: houseId
                  ? houseDetail.get('subHouseArea')
                  : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0 || !isOnPropertyShow}
                  style={{ width: '100%' }}
                  min={0}
                  max={100000}
                  precision={2}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1020}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="初始单价">
              {getFieldDecorator('unitprice', {
                initialValue: houseId ? houseDetail.get('unitprice') : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  style={{ width: '100%' }}
                  min={0}
                  max={1000000000}
                  precision={0}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1021}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="总价">
              {getFieldDecorator('totalPrice', {
                initialValue: houseId
                  ? houseDetail.get('totalPrice')
                  : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  style={{ width: '100%' }}
                  min={0}
                  max={1000000000000000}
                  placeholder="请输入"
                  precision={2}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1022}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="是否有厨房">
              {getFieldDecorator('isWithKitchen', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('isWithKitchen'))
                  : undefined
              })(
                <Select
                  disabled={buildStatus === 0}
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                >
                  {whetherType.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1023}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="阳台数">
              {getFieldDecorator('balconyNum', {
                initialValue: houseId
                  ? houseDetail.get('balconyNum')
                  : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  style={{ width: '100%' }}
                  min={0}
                  max={100000}
                  precision={0}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1024}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="洗手间数">
              {getFieldDecorator('washroomNum', {
                initialValue: houseId
                  ? houseDetail.get('washroomNum')
                  : undefined
              })(
                <InputNumber
                  disabled={buildStatus === 0}
                  style={{ width: '100%' }}
                  min={0}
                  max={100000}
                  precision={0}
                  placeholder="请输入"
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1025}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="是否带花园">
              {getFieldDecorator('hasGarden', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('hasGarden'))
                  : undefined
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  disabled={buildStatus === 0}
                >
                  {whetherType.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1026}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        <Row>
          <Col span={8}>
            <FormItem {...formItemLayout} label="是否可估">
              {getFieldDecorator('isAbleEvaluated', {
                initialValue: houseId
                  ? this.formatString(houseDetail.get('isAbleEvaluated'))
                  : undefined
              })(
                <Select
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  allowClear
                  disabled={buildStatus === 0}
                >
                  {whetherType.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1027}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}

          <Col span={8}>
            <FormItem {...formItemLayout} label="备注">
              {getFieldDecorator('remark', {
                initialValue: houseId ? houseDetail.get('remark') : undefined
              })(
                <TextArea
                  maxLength={255}
                  autosize={{ maxRows: 4 }}
                  disabled={buildStatus === 0}
                />
              )}
            </FormItem>
          </Col>
          {houseId ? (
            <Col span={2}>
              <FormItem>
                <DataTrackComp
                  fromURL="houseInfo"
                  field={1028}
                  qryId={houseId}
                />
              </FormItem>
            </Col>
          ) : null}
        </Row>
        {buildStatus === 1 ? (
          <Row>
            <Col span={8}>
              <FormItem {...formItemLayout} label=" " colon={false}>
                <Fragment>
                  {houseId ? (
                    <Fragment>
                      {pagePermission(
                        'fdc:hd:residence:base:roomNum:change'
                      ) ? (
                        <Button type="primary" htmlType="submit">
                          保存
                        </Button>
                      ) : (
                        ''
                      )}
                    </Fragment>
                  ) : (
                    <Fragment>
                      {pagePermission('fdc:hd:residence:base:roomNum:add') ? (
                        <Button type="primary" htmlType="submit">
                          保存
                        </Button>
                      ) : (
                        ''
                      )}
                    </Fragment>
                  )}
                </Fragment>
                {houseId ? (
                  <Fragment>
                    {pagePermission('fdc:hd:residence:base:roomNum:delete') ? (
                      <Button
                        type="danger"
                        icon="delete"
                        onClick={this.handleDel}
                        style={{ marginLeft: 16 }}
                      >
                        删除
                      </Button>
                    ) : (
                      ''
                    )}
                  </Fragment>
                ) : (
                  ''
                )}
              </FormItem>
            </Col>
          </Row>
        ) : null}
      </Form>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>{this.renderForm()}</div>
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
)(HouseNameEdit)
