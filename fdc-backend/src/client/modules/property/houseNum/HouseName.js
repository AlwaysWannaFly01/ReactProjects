import React, { Component, Fragment } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
  Table,
  Form,
  Row,
  Col,
  Button,
  Input,
  Message,
  InputNumber,
  Popconfirm,
  Popover
} from 'antd'
// import { parse } from 'qs'
import { Link } from 'react-router-dom'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import router from 'client/router'
import layout from 'client/utils/layout'
import shallowEqual from 'client/utils/shallowEqual'
import fillupFloor from 'client/utils/fillupFloor'

import FloorEdit from './Floor.edit'

import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'
import styles from './HouseNum.less'

const FormItem = Form.Item

const FIXED_KEYS = ['key', 'floorNo', 'actualFloor', 'isAddFloor']
const FIXED_COLS = ['物理层', '实际层']

/**
 * @author YJF
 * @description 房号列表Table
 */
/* eslint-disable */
class HouseName extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    // location: PropTypes.object.isRequired,
    dataList: PropTypes.array.isRequired,
    houseTitle: PropTypes.array.isRequired,
    getDataList: PropTypes.func.isRequired,
    buildId: PropTypes.string.isRequired,
    addHouseName: PropTypes.func.isRequired,
    delAllHouse: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
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
    // const { cityId, cityName } = parse(props.location.search.substr(1))
    this.state = {
      houseNameTitle: [
        {
          title: '物理层',
          dataIndex: 'floorNo',
          width: 80
        },
        {
          title: '实际层',
          render: ({ floorNo, actualFloor, isAddFloor }) => (
            <span>
              {isAddFloor ||
              !pagePermission('fdc:hd:residence:base:roomNum:change') ? (
                actualFloor
              ) : (
                <a onClick={() => this.updateFloor(floorNo, actualFloor)}>
                  {actualFloor}
                </a>
              )}
            </span>
          ),
          width: 80
        }
      ],
      dataList: [],

      // 修改实际层Modal
      floorEditVisible: false,
      // 修改楼层参数
      floorEditParam: {
        floorNo: '',
        actualFloor: ''
      },

      // 已删除的楼层
      delFloorArr: [],
      // 删除楼层时，删除的单元室号
      delUnitHouse: [],
      // 直接删除单元室号
      delHouseColumns: [],
      // 新增的单元室号
      addUnitHouse: [],
      // 删除单元室号的id
      delHouseIds: [],

      // 新增按钮Loading
      submitBtnLoading: false
      // cityId,
      // cityName
    }
  }

  componentDidMount() {
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (this.cityId) {
        clearInterval(this.cityIdInterval)
        this.getDataList()
      }
    }, 100)
  }

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(this.props.dataList, nextProps.dataList)) {
      const { houseTitle, dataList, buildStatus } = nextProps
      const houseNameTitle = []
      const addUnitHouse = []
      houseTitle.forEach(item => {
        const itemArr = item.split(',')
        // 排除掉title中的floorNo和actualFloor
        if (itemArr.length === 2) {
          const title = itemArr.join('')
          addUnitHouse.push(title)
          houseNameTitle.push({
            title: item,
            width: 100,
            render: record => {
              const { floorNo } = record
              // houseId , 单元 - unitNo, 室号 - roomNo, 房号名称 - houseName
              // 有房号名称，则显示房号名称，没有则拼接 id + 单元 + 室内
              if (record[title]) {
                const [houseId, unitNo, roomNo, houseName] = record[
                  title
                ].split(',')
                const { projectId, buildId, cityId, cityName } = this.props // eslint-disable-line
                let houseNameStr = ''
                if (houseName) {
                  houseNameStr = houseName
                } else if (unitNo || roomNo) {
                  houseNameStr = `${unitNo}${floorNo}${roomNo}`
                }

                return (
                  <div>
                    {houseId ? (
                      <Link
                        to={{
                          pathname: router.RES_HOUSE_NUM_EDIT,
                          search: `projectId=${projectId}&buildId=${buildId}&houseId=${houseId}&cityId=${cityId}&cityName=${cityName}`
                        }}
                      >
                        <Popover
                          content={
                            <div
                              style={{
                                maxWidth: '200px',
                                wordWrap: 'break-word'
                              }}
                            >
                              {houseNameStr}
                            </div>
                          }
                          title={false}
                          placement="topLeft"
                        >
                          <div className={styles.addLine}>{houseNameStr}</div>
                        </Popover>
                      </Link>
                    ) : (
                      <Popover
                        content={
                          <div
                            style={{
                              maxWidth: '200px',
                              wordWrap: 'break-word'
                            }}
                          >
                            {houseNameStr}
                          </div>
                        }
                        title={false}
                        placement="topLeft"
                      >
                        <div className={styles.addLine}>{houseNameStr}</div>
                      </Popover>
                    )}
                  </div>
                )
              }
              return null
            }
          })
        }
      })

      let newDataList = []
      dataList.forEach(item => {
        newDataList.push(Object.assign({}, item))
      })
      newDataList = fillupFloor(newDataList)

      this.setState({
        houseNameTitle: [...this.state.houseNameTitle, ...houseNameTitle],
        // houseNameTitle: this.fixedTitle.concat(houseNameTitle),
        dataList: newDataList,
        addUnitHouse
      })
    }
  }

  getDataList = () => {
    const qry = {
      cityId: this.cityId,
      buildingId: this.props.buildId,
      fieldName: 'houseName'
    }
    this.props.getDataList(qry)
  }

  // 修改实际楼层 判定为正式楼栋才执行
  updateFloor = (floorNo, actualFloor) => {
    if (this.props.buildStatus === 1) {
      const floorEditParam = {
        floorNo,
        actualFloor
      }
      this.setState({
        floorEditVisible: true,
        floorEditParam
      })
    } else {
      Message.warn('为已删除状态，无法修改。')
    }
  }

  handleCloseFloorEdit = () => {
    this.setState({
      floorEditVisible: false
    })
  }

  // 新增楼层
  handleAddFloor = () => {
    const { houseNameTitle, dataList } = this.state
    const addFloor = this.props.form.getFieldValue('floorNo')
    if (addFloor) {
      const hasFloor =
        dataList.length > 0
          ? dataList.filter(item => +item.floorNo === +addFloor)
          : []
      if (hasFloor.length > 0) {
        // 功能应该是批量新增房号，目前只是去新增房号中单笔新增。
        Message.warn('已存在楼层')
      } else {
        const len = dataList.length
        const minFloor = len > 0 ? dataList[0].floorNo : 0
        const maxFloor = len > 0 ? dataList[len - 1].floorNo : 0
        if (addFloor < minFloor) {
          const depth = minFloor - addFloor
          let newAddFloorList = []
          // 获取 数组对象keys
          const existedKeys = []
          houseNameTitle.forEach(item => {
            // 排除掉['floorNo', 'actualFloor']
            if (item.title.split(',').length === 2) {
              existedKeys.push(item.title)
            }
          })
          const fixedKeys = FIXED_KEYS
          for (let i = depth; i > 0; i -= 1) {
            // 固定字段填充值
            const addObj = {
              key: minFloor - i,
              floorNo: minFloor - i,
              actualFloor: `${minFloor - i}层`,
              isAddFloor: true
            }
            for (let j = 0; j < existedKeys.length; j += 1) {
              const isFixedKeys = fixedKeys.some(
                item => item === existedKeys[j]
              )
              if (!isFixedKeys) {
                // 新增楼层 对新增的列 进行填充字段 直接继承
                const colValue = existedKeys[j]
                const colValueArr = colValue.split(',')
                const [unitHouse, unitName] = colValueArr

                addObj[colValueArr.join('')] = `,${unitHouse},${unitName}`
              }
            }
            newAddFloorList.push(addObj)
          }
          // 排除掉0层
          newAddFloorList = newAddFloorList.filter(item => item.floorNo !== 0)
          this.setState({
            dataList: [...newAddFloorList, ...dataList]
          })
        } else {
          const depth = addFloor - maxFloor
          let newAddFloorList = []
          // 获取 数组对象keys

          const existedKeys = []
          houseNameTitle.forEach(item => {
            // 排除掉['floorNo', 'actualFloor']
            if (item.title.split(',').length === 2) {
              existedKeys.push(item.title)
            }
          })
          const fixedKeys = FIXED_KEYS
          for (let i = 1; i <= depth; i += 1) {
            // 固定字段填充值
            const addObj = {
              key: maxFloor + i,
              floorNo: maxFloor + i,
              actualFloor: `${maxFloor + i}层`,
              isAddFloor: true
            }
            for (let j = 0; j < existedKeys.length; j += 1) {
              const isFixedKeys = fixedKeys.some(
                item => item === existedKeys[j]
              )
              if (!isFixedKeys) {
                // 新增楼层 对新增的列 进行填充字段 直接继承
                const colValue = existedKeys[j]
                const colValueArr = colValue.split(',')
                const [unitHouse, unitName] = colValueArr

                addObj[colValueArr.join('')] = `,${unitHouse},${unitName}`
              }
            }
            newAddFloorList.push(addObj)
          }

          // 排除掉0层
          newAddFloorList = newAddFloorList.filter(item => item.floorNo !== 0)
          this.setState({
            dataList: [...dataList, ...newAddFloorList]
          })
        }
      }
    } else {
      const tipMsg = addFloor === 0 ? '物理层不能为0' : '请输入楼层'
      Message.warn(tipMsg)
    }
  }

  // 删除楼层
  handleDelFloor = () => {
    const { dataList } = this.state
    const delFloor = this.props.form.getFieldValue('floorNo')
    if (delFloor) {
      const hasFloor = dataList.filter(item => +item.floorNo === +delFloor)
      if (hasFloor.length <= 0) {
        Message.warn('不存在的楼层')
      } else {
        const delFloorArr = []
        const delUnitHouse = []
        let newDataList = []

        delFloorArr.push(delFloor)
        newDataList = dataList.map(item => {
          if (+item.floorNo === +delFloor) {
            const keys = Object.keys(item)
            const fixedKeys = FIXED_KEYS
            for (let i = 0; i < keys.length; i += 1) {
              const isFixedKeys = fixedKeys.some(item => item === keys[i])
              if (!isFixedKeys) {
                delUnitHouse.push(`${delFloor},${keys[i]}`)
                const id = item[keys[i]].split(',')[0]
                item[keys[i]] = `${id},,`
                // item[keys[i]] = ''
              }
            }
          }
          return item
        })
        this.setState({
          delFloorArr: [...this.state.delFloorArr, ...delFloorArr],
          delUnitHouse: [...this.state.delUnitHouse, ...delUnitHouse],
          dataList: newDataList
        })
      }
    } else {
      Message.warn('请先输入楼层')
    }
  }

  // 新增单元室号
  handleAddBuild = () => {
    const { houseNameTitle, dataList, addUnitHouse } = this.state

    // 如果没有物理层，不让新增单元室号
    if (dataList.length > 0) {
      this.props.form.validateFields(['build', 'house'], (err, values) => {
        if (!err) {
          let { build = '', house } = values
          build = build ? build.trim() : build
          house = house ? house.trim() : house

          const addBuild = `${build},${house}`
          const hasTitle = houseNameTitle.filter(
            item => item.title === addBuild
          )
          if (hasTitle.length) {
            Message.warn('已存在单元室号')
          } else {
            const dataIndex = addBuild.split(',').join('')

            const { projectId, buildId } = this.props

            if (!addUnitHouse.includes(dataIndex)) {
              addUnitHouse.push(dataIndex)
            }

            const newBuild = {
              title: addBuild,
              width: 100,
              render: record => {
                let content = ''
                if (record[dataIndex]) {
                  const [houseId, build, house] = record[dataIndex].split(',')
                  if (build || house) {
                    content = build + record.floorNo + house
                  }

                  return (
                    <span>
                      {houseId ? (
                        <Link
                          to={{
                            pathname: router.RES_HOUSE_NUM_EDIT,
                            search: `projectId=${projectId}&buildId=${buildId}`
                          }}
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </span>
                  )
                }
                return null
              }
            }

            const newDataList = dataList.map(item => {
              item[dataIndex] = `,${build},${house}`
              return item
            })

            this.setState({
              houseNameTitle: [...houseNameTitle, newBuild],
              delUnitHouse: this.state.delUnitHouse.filter(
                item => item !== addBuild
              ),
              dataList: newDataList,
              addUnitHouse
            })
          }
        }
      })
    } else {
      Message.warn('请先新增楼层')
    }
  }

  // 删除单元室号
  handleDelBuild = () => {
    const { houseNameTitle, dataList, addUnitHouse } = this.state
    const build = this.props.form.getFieldValue('build') || ''
    const house = this.props.form.getFieldValue('house') || ''

    const delBuild = `${build},${house}`
    if (FIXED_COLS.includes(delBuild)) {
      Message.warn('固定列')
    } else {
      const hasTitle = houseNameTitle.filter(item => item.title === delBuild)
      if (hasTitle.length <= 0) {
        Message.warn('不存在的单元室')
      } else {
        const dataIndex = delBuild

        const newHouseNumTitle = houseNameTitle.filter(
          item => item.title !== delBuild
        )

        const newUnitHouse = addUnitHouse.filter(
          item => item !== `${build}${house}`
        )

        const delHouseIds = []
        dataList.forEach(dataItem => {
          if (dataItem[delBuild]) {
            const houseId = dataItem[delBuild].split(',')[0]
            if (houseId) {
              delHouseIds.push(houseId)
            }
          }
        })

        this.setState({
          houseNameTitle: [...newHouseNumTitle],
          // delUnitHouse: [...this.state.delUnitHouse, dataIndex],
          delHouseColumns: [...this.state.delHouseColumns, dataIndex],
          addUnitHouse: newUnitHouse,
          delHouseIds: [...this.state.delHouseIds, ...delHouseIds]
        })
      }
    }
  }

  // 清空房号
  handleClearAllHouse = () => {
    const qry = {
      cityId: this.cityId,
      buildingId: this.props.buildId
    }
    this.props.delAllHouse(qry, () => {
      Message.success('清空所有房号')
      this.clearHouseNameTemp()
      this.resfreshHouseNameTitle()
      this.getDataList()
    })
  }

  resfreshHouseNameTitle = () => {
    // const { buildStatus } = this.props
    this.setState({
      houseNameTitle: [
        {
          title: '物理层',
          dataIndex: 'floorNo',
          width: 80
        },
        {
          title: '实际层',
          render: ({ floorNo, actualFloor, isAddFloor }) => (
            <span>
              {isAddFloor ? (
                actualFloor
              ) : (
                <a onClick={() => this.updateFloor(floorNo, actualFloor)}>
                  {actualFloor}
                </a>
              )}
            </span>
          ),
          width: 80
        }
      ]
    })
  }

  refreshPage = () => {
    this.resfreshHouseNameTitle()
    this.getDataList()
  }

  // 保存房号成功后,清除零时保存数据
  clearHouseNameTemp = () => {
    this.setState({
      delFloorArr: [],
      delUnitHouse: [],
      delHouseColumns: [],
      addUnitHouse: [],
      delHouseIds: []
    })
  }

  // 保存房号
  handleSubmitHouseName = () => {
    this.setState({
      submitBtnLoading: true
    })

    const {
      dataList,
      delFloorArr,
      delUnitHouse,
      delHouseColumns,
      addUnitHouse,
      delHouseIds
    } = this.state
    // console.log(
    //   dataList,
    //   delFloorArr,
    //   delHouseColumns,
    //   delUnitHouse,
    //   delHouseIds,
    //   addUnitHouse,
    //   11
    // )
    // 新增数据集合
    const addHouse = []
    // 已删除数据集合 - houseIds
    const delHouse = [...delHouseIds]

    dataList.forEach(item => {
      const newItem = Object.assign({}, item)
      if (item.isAddFloor) {
        // 1. 如果是新增楼层
        // 1.1 处理已删除的行的列
        // 1.2 删除掉多余字段，新增楼层
        delFloorArr.forEach(delFloorItem => {
          if (delFloorItem === newItem.floorNo) {
            delUnitHouse.forEach(unitHouse => {
              const [delFloorNo, delUnitHouseF] = unitHouse.split(',')
              if (+delFloorNo === item.floorNo) {
                delete newItem[delUnitHouseF]
                delete newItem.key
                delete newItem.isAddFloor
              }
            })
          }
        })

        // 2.处理删除的列
        const keys = Object.keys(newItem)
        delHouseColumns.forEach(delItem => {
          const delItemStr = delItem.split(',').join('')
          if (keys.includes(delItemStr)) {
            delete newItem[delItemStr]
          }
        })

        addHouse.push(newItem)
      } else {
        // 2. 如果是已有的楼层
        // 2.1 处理已删除的行
        delFloorArr.forEach(delFloorItem => {
          // console.log(delFloorArr, newItem, delUnitHouse, 222)
          if (delFloorItem === newItem.floorNo) {
            delUnitHouse.forEach(unitHouse => {
              const [delFloorNo, delUnitHouseF] = unitHouse.split(',')

              if (+delFloorNo === delFloorItem) {
                // 如果有值
                if (newItem[delUnitHouseF]) {
                  const id = newItem[delUnitHouseF].split(',')[0]
                  delete newItem[delUnitHouseF]
                  delHouse.push(id)
                }
              }
            })
          }
        })

        // 2.2 处理新增的列
        addUnitHouse.forEach(addUnitHouseItem => {
          if (newItem[addUnitHouseItem]) {
            const houseId = newItem[addUnitHouseItem].split(',')[0]
            delete newItem.key
            delete newItem.isAddFloor
            if (houseId) {
              delete newItem[addUnitHouseItem]
            }
          }
        })

        // 2.3 处理删除的列
        const keys = Object.keys(newItem)
        delHouseColumns.forEach(delItem => {
          const delItemStr = delItem.split(',').join('')
          if (keys.includes(delItemStr)) {
            const houseId = newItem[delItemStr].split(',')[0]
            if (houseId) {
              delHouse.push(houseId)
            }
            delete newItem[delItemStr]
          }
        })

        addHouse.push(newItem)
      }
    })

    const newAddHouse = []
    addHouse.forEach(item => {
      newAddHouse.push(Object.assign({}, item))
    })

    // console.log(addHouse, newAddHouse, 222)

    newAddHouse.map(house => {
      const keys = Object.keys(house)
      const houseCols = []
      keys.forEach(key => {
        if (!['floorNo', 'actualFloor', 'key', 'isAddFloor'].includes(key)) {
          const houseId = house[key].split(',')[0]
          if (!houseId) {
            houseCols.push(house[key])
          }
          delete house[key]
        }
      })
      // houseCols[] 新增列集合
      delete house.key
      delete house.isAddFloor
      house.houseCols = houseCols

      return house
    })

    const postData = {
      addHouse: newAddHouse,
      delHouse: delHouse.filter(i => i),
      cityId: this.cityId,
      buildingId: this.props.buildId
    }

    // console.log(newAddHouse, 333)

    // console.log(postData, '提交数据')
    if (addHouse.length > 0 || delHouse.length > 0) {
      this.props.addHouseName(postData, res => {
        const { code, message } = res
        if (+code === 200) {
          Message.success('保存成功')
          this.clearHouseNameTemp()
          this.refreshPage()
        } else {
          Message.error(message)
        }
        this.setState({
          submitBtnLoading: false
        })
      })
    } else {
      Message.warn('没有修改的数据')
      this.setState({
        submitBtnLoading: false
      })
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const { houseNameTitle = [], dataList } = this.state
    const columns = []

    houseNameTitle.forEach(item => {
      const newItem = Object.assign({}, item)
      const itemArr = newItem.title.split(',')
      if (itemArr.length > 1) {
        newItem.title = itemArr.join('')
      }
      columns.push(newItem)
    })

    // console.log(dataList, houseNameTitle, 'render')

    const { projectId, buildId, buildStatus, cityId, cityName } = this.props

    let x = 120
    if (houseNameTitle.length) {
      x = 100 * houseNameTitle.length + 1200
    }

    return (
      <div>
        <Table
          columns={columns}
          dataSource={dataList}
          pagination={false}
          loading={this.context.loading.includes(actions.GET_DATA_LIST)}
          scroll={{ x, y: 400 }}
          className={styles.defineTable}
        />
        {buildStatus === 1 ? (
          <div>
            <Row style={{ marginTop: 16 }}>
              <Col span={4}>
                <FormItem
                  label="楼层号"
                  labelCol={layout(6, 8)}
                  wrapperCol={layout(18, 14)}
                >
                  {getFieldDecorator('floorNo')(
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="楼层号"
                      max={200}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={20}>
                <FormItem>
                  {pagePermission('fdc:hd:residence:base:roomNum:batch') ? (
                    <Fragment>
                      <Button
                        onClick={this.handleAddFloor}
                        style={{ marginRight: 16 }}
                        type="primary"
                      >
                        新增楼层
                      </Button>
                      <Button onClick={this.handleDelFloor} type="danger">
                        删除楼层
                      </Button>
                    </Fragment>
                  ) : (
                    ''
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={4}>
                <FormItem
                  label="单元"
                  labelCol={layout(6, 8)}
                  wrapperCol={layout(18, 14)}
                >
                  {getFieldDecorator('build', {
                    rules: [
                      {
                        whitespace: true,
                        message: '请输入单元'
                      },
                      {
                        max: 20,
                        message: '长度不超过20'
                      }
                    ]
                  })(<Input placeholder="单元号" />)}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem
                  label="室号"
                  labelCol={layout(6, 8)}
                  wrapperCol={layout(18, 14)}
                >
                  {getFieldDecorator('house', {
                    rules: [
                      {
                        required: true,
                        message: '请输入室号'
                      },
                      {
                        whitespace: true,
                        message: '请输入室号'
                      },
                      {
                        max: 20,
                        message: '长度不超过20'
                      }
                    ]
                  })(<Input placeholder="室号" />)}
                </FormItem>
              </Col>
              <Col span={16}>
                <FormItem>
                  {pagePermission('fdc:hd:residence:base:roomNum:batch') ? (
                    <Fragment>
                      <Button
                        onClick={this.handleAddBuild}
                        type="primary"
                        style={{ marginRight: 16 }}
                      >
                        新增单元室号
                      </Button>
                      <Button
                        onClick={this.handleDelBuild}
                        type="danger"
                        style={{ marginRight: 16 }}
                      >
                        删除单元室号
                      </Button>
                    </Fragment>
                  ) : (
                    ''
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              {pagePermission('fdc:hd:residence:base:roomNum:batch') ? (
                <Button
                  style={{ marginRight: 16 }}
                  type="primary"
                  onClick={this.handleSubmitHouseName}
                  loading={this.state.submitBtnLoading}
                >
                  保存房号
                </Button>
              ) : (
                ''
              )}

              {this.props.dataList.length ? (
                <span>
                  {pagePermission('fdc:hd:residence:base:roomNum:empty') ? (
                    <Popconfirm
                      title="确定清空房号？"
                      onConfirm={this.handleClearAllHouse}
                    >
                      <Button style={{ marginRight: 16 }} type="danger">
                        清空房号
                      </Button>
                    </Popconfirm>
                  ) : (
                    ''
                  )}

                  <Link
                    to={{
                      pathname: router.RES_HOUSE_NUM_EDIT,
                      // search: `projectId=${projectId}&buildId=${buildId}`
                      search: `projectId=${projectId}&buildId=${buildId}&cityId=${cityId}&cityName=${cityName}`
                    }}
                  >
                    {pagePermission('fdc:hd:residence:base:roomNum:add') ? (
                      <Button type="primary">新增房号</Button>
                    ) : (
                      ''
                    )}
                  </Link>
                </span>
              ) : null}
            </Row>
          </div>
        ) : null}
        <FloorEdit
          floorEditVisible={this.state.floorEditVisible}
          onCloseFloorEdit={this.handleCloseFloorEdit}
          floorEditParam={this.state.floorEditParam}
          buildId={this.props.buildId}
          onRefreshPage={this.refreshPage}
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
)(HouseName)
