import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Immutable from 'immutable'
import { parse } from 'qs'
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
  Modal,
  Popover,
  Message,
  Switch
} from 'antd'
import showTotal from 'client/utils/showTotal'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import {
  breadEditList,
  editColumns,
  popupColumns,
  columnsDetail
} from './constant'
import styles from './RoomNumber.less'

/**
 * @description 数据审核-DC模块
 * @author WY
 */

class AuditBuildingEdit extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    model: PropTypes.object.isRequired,
    getHouseDetail: PropTypes.func.isRequired,
    houseDetail: PropTypes.object.isRequired, // 有修改object
    getfdcHouseList: PropTypes.func.isRequired,
    fdcHouseList: PropTypes.array.isRequired, // 点击‘单元室号’出来的表格数据
    fdcRoomCheckCB: PropTypes.func.isRequired,
    getPreMatchList: PropTypes.func.isRequired, // 换成回调函数
    sureButton: PropTypes.func.isRequired,
    getConditionList: PropTypes.func.isRequired, // 房号关联情况
    conditionList: PropTypes.object.isRequired,
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
      houseId: search.houseId,
      fdcBuildingId: search.fdcBuildingId,
      cityId: search.cityId,
      cityName: search.cityName,
      areaName: search.areaName,
      // projectName: search.projectName,
      // buildingName: search.buildingName,
      // 是否是删除状态
      fdcBuildingStatus: search.fdcBuildingStatus,
      fdcProjectStatus: search.fdcProjectStatus,
      // 处理状态
      processState: search.processState,
      flag: 0, // 0为不展示 1为正式房号 2为转他人
      visiblePop: false,
      visibleCancel: false,
      preMatchList: {},
      matchList: []
    }
  }

  componentDidMount() {
    const { houseId, cityId } = this.state
    this.props.getHouseDetail(houseId)
    // 房号关联情况
    this.props.getConditionList(houseId)
    this.props.getAuthorityList({ cityId })
  }
  changeBuilding = (flag, url) => {
    const { cityId, fdcBuildingId, houseId } = this.state
    this.setState({ flag })
    if (flag === 1) {
      const params = {
        pageNum: 1,
        pageSize: 20,
        cityId,
        fdcBuildingId: fdcBuildingId === 'null' ? '' : fdcBuildingId,
        houseId
      }
      this.props.getfdcHouseList(params)
    } else if (flag === 5) {
      this.context.router.history.push({
        pathname: router.AUDIT_NUMBER
      })
    } else {
      // 自行判断
      this.props.fdcRoomCheckCB(url, { id: houseId }, (code, message) => {
        if (code === '200') {
          Message.success('操作成功')
          // eslint-disable-next-line
          const {
            areaId,
            fdcProjectId,
            fdcBuildingId,
            projectName,
            buildingName,
            cityValues,
            pageNum
          } = parse(sessionStorage.getItem('ROOM_NUMBER_SEARCH'))

          const baseInfoSearch = `&fdcProjectId=${fdcProjectId ||
            ''}&projectName=${projectName || ''}&buildingName=${buildingName ||
            ''}&fdcBuildingId=${fdcBuildingId ||
            ''}&cityValues=${cityValues}&areaId=${areaId}&pageNum=${pageNum}`
          // 将DC楼盘列表查询条件设置到 sessionStorage
          sessionStorage.setItem('ROOM_NUMBER_SEARCH', baseInfoSearch)
          this.context.router.history.push({
            pathname: router.AUDIT_NUMBER,
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
    const { cityId, fdcBuildingId, houseId } = this.state
    this.props.form.validateFields(['keyword'], (err, values) => {
      if (!err) {
        const params = {
          pageNum,
          pageSize: 20,
          cityId,
          fdcBuildingId,
          houseId,
          keyword: values.keyword
        }
        this.props.getfdcHouseList(params)
      }
    })
  }

  changeMatch = (fdcHouseId, matchStatus) => {
    const { matchList } = this.state
    matchList.forEach(i => {
      if (i.fdcHouseId === fdcHouseId) {
        i.matchStatus = matchStatus === 1 ? 0 : 1
      }
    })
    this.setState({ matchList })
  }

  showModal = fdcHouseId => {
    const { houseId } = this.state
    this.setState({
      visiblePop: true
    })
    // 确定房号关联
    this.props.getPreMatchList(
      {
        fdcHouseId,
        houseId
      },
      data => {
        this.setState({
          preMatchList: data,
          matchList: data.matchList
        })
      }
    )
  }

  showModalCancel = () => {
    this.setState({
      visibleCancel: true
    })
  }

  handleOkPop = e => {
    const { matchList, houseId, cityId, fdcBuildingId } = this.state // eslint-disable-line
    // eslint-disable-next-line
    const params = matchList.map(item => {
      return {
        id: item.houseId,
        matchId: item.fdcHouseId,
        matchStatus: item.matchStatus
      }
    })
    this.props.sureButton(params, (data, msg, code) => {
      if (code === '200') {
        Message.success('关联成功')
        const paramsClick = {
          pageNum: 1,
          pageSize: 20,
          cityId,
          fdcBuildingId: fdcBuildingId === 'null' ? '' : fdcBuildingId,
          houseId
        }
        this.props.getfdcHouseList(paramsClick)
        this.props.getHouseDetail(houseId)
        this.handleCancelPop(e)
        // 房号关联情况
        this.props.getConditionList(houseId)
      } else {
        Message.error(msg)
      }
    })
  }

  handleCancelPop = () => {
    this.setState({
      visiblePop: false
    })
  }

  // 关联操作
  handleOkCancel = (matchStatus, id, matchCurrent) => {
    this.changeStatus(matchStatus, id, matchCurrent)
    this.handleCancel()
  }

  handleCancel = () => {
    this.setState({
      visibleCancel: false
    })
  }

  infoDc() {
    Modal.warning({
      title: '该DC单元室号已关联了FDC的另一个单元室号'
    })
  }

  infoFdc() {
    Modal.warning({
      title: '该FDC单元室号已被DC的另一个单元室号关联了'
    })
  }

  changeStatus = (matchStatus, sid, matchCurrent) => {
    const { houseId } = this.state
    const params = {
      id: houseId,
      matchStatus: matchStatus ? 0 : 1,
      matchId: sid
    }
    this.props.fdcRoomCheckCB(
      '/houseDcCheck/cancelMatch',
      params,
      (code, message) => {
        if (code === '200') {
          if (matchCurrent === 0) {
            Message.success('关联成功')
          }
          if (matchCurrent === 1) {
            Message.success('取消关联成功')
          }
          this.changeBuilding(1, null)
          this.props.getHouseDetail(houseId)
          // 房号关联情况
          this.props.getConditionList(houseId)
        } else {
          Message.error(message)
        }
      }
    )
  }

  openHouse = () => {
    const { cityId, cityName } = this.state
    const { fdcBuildingId, fdcProjectId } = this.props.houseDetail
    this.props.updateVisitCities({ cityId, cityName }, () => {
      window.open(
        `${
          router.RES_HOUSE_NUM
        }?cityId=${cityId}&projectId=${fdcProjectId}&buildId=${fdcBuildingId}`
      )
    })
  }
  authorityModal() {
    Modal.error({
      title: '温馨提示：',
      content: '你没有该单元室号的城市权限，不允许下一步操作'
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
    // 房号头部详情
    const { houseDetail } = this.props
    const { houseList } = this.props.houseDetail
    const { processState } = this.state

    return (
      <div className={styles.contentShow}>
        <div className={styles.contentAll}>
          <div className={styles.titleStyleHeader}>
            <span className={styles.titleStyle} />
            <span className={styles.showTitle}>DC单元室号详细信息:</span>
          </div>
          <div className={styles.labelAll}>
            <Row>
              <Col span={24}>
                <span className={styles.labelRight}>数据建设机构：</span>
                <span>{houseDetail.companyName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>城市：</span>
                <span>{houseDetail.cityName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>行政区：</span>
                <span>{houseDetail.areaName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼盘名称：</span>
                <span>{houseDetail.projectName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>楼栋名称：</span>
                <span>{houseDetail.buildingName}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>单元室号：</span>
                <span>
                  {houseDetail.unitNo}
                  {houseDetail.roomNum}
                </span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>房号最高楼层：</span>
                <span>{houseDetail.houseMaxFloor}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>单元室号总楼层：</span>
                <span>{houseDetail.totalFloor}</span>
              </Col>
              <Col span={12}>
                <span className={styles.labelRight}>房号总数：</span>
                <span>{houseDetail.totalHouse}</span>
              </Col>
            </Row>
          </div>
          {/* 详情表格 */}
          <div>
            <Table
              rowKey="id"
              pagination={false}
              columns={columnsDetail}
              dataSource={houseList}
              scroll={{ x: 3500, y: 500 }}
              className={styles.tableDetailRoom}
            />
          </div>
        </div>
        <div className={styles.contentButton}>
          <Row>
            <Col span={3}>
              <Button
                type="primary"
                onClick={() => this.changeBuilding(1, '/houseDcCheck/match')}
              >
                单元室号关联
              </Button>
            </Col>
            <Col span={3} offset={1}>
              <Button
                type="primary"
                disabled
                onClick={() => this.changeBuilding(2, '/houseDcCheck/match')}
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
                    this.changeBuilding(0, '/houseDcCheck/notMatch')
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
                onConfirm={() => this.changeBuilding(4, '/houseDcCheck/trash')}
                okText="确认"
                cancelText="取消"
              >
                <Button type="dashed">丢垃圾箱</Button>
              </Popconfirm>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  renderTable() {
    const { getFieldDecorator } = this.props.form
    const { authorityList } = this.props

    const {
      flag,
      fdcBuildingStatus, // 楼栋关联状态 是否是删除 0是删除状态
      fdcProjectStatus, // 楼盘关联状态 0是删除状态
      cityName,
      areaName,
      matchList
    } = this.state // eslint-disable-line
    // 房号头部详情
    const { houseDetail } = this.props
    const { fdcHouseId } = this.props.houseDetail
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
    const columns = [
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
                    {fdcHouseId ? (
                      <Switch checked={!!matchCurrent} onClick={this.infoDc} />
                    ) : (
                      <Switch
                        checked={!!matchCurrent}
                        onClick={() => this.showModal(id)}
                      />
                    )}
                  </div>
                ) : (
                  <Switch checked={!!matchCurrent} onClick={this.infoFdc} />
                )}
              </div>
            ) : (
              <div>
                <Switch
                  checked={!!matchCurrent}
                  onClick={this.showModalCancel}
                />
                <Modal
                  visible={this.state.visibleCancel}
                  onOk={() =>
                    this.handleOkCancel(matchStatus, id, matchCurrent)
                  }
                  onCancel={this.handleCancel}
                  okText="是"
                  cancelText="否"
                  closable={false}
                >
                  <p>将取消该单元室号的匹配关联，是否确定取消？</p>
                </Modal>
              </div>
            )}
          </div>
        )
      }
    ]
    const columnsPopup = [
      ...popupColumns,
      {
        title: '确定关联',
        width: 150,
        render: ({ matchStatus, fdcHouseId }) => (
          <div>
            <Switch
              checked={!!matchStatus}
              onChange={() => this.changeMatch(fdcHouseId, matchStatus)}
            />
          </div>
        )
      }
    ]
    const columnsCondition = [
      ...popupColumns,
      {
        title: '是否关联',
        dataIndex: 'matchStatus',
        width: 120,
        render: matchStatus => {
          if (matchStatus === 1) {
            return '是'
          } else if (matchStatus === 0) {
            return '否'
          }
          return null
        }
      }
    ]
    const {
      preMatchList: { fdcUnitRoom, unitRoom }
    } = this.state
    const conditionTable = this.props.conditionList.matchList
    const unitRoomCondition = this.props.conditionList.unitRoom
    const fdcUnitRoomCondition = this.props.conditionList.fdcUnitRoom
    // 房号头部详情
    // const { houseDetail } = this.props
    return (
      <div>
        <div>
          {flag === 1 ? (
            <div className={styles.editTable}>
              <div className={styles.flexMiddle}>
                <div className={styles.flexborder}>
                  {cityName}-{areaName}-{houseDetail.fdcProjectName}-
                  {houseDetail.fdcBuildingName}
                </div>
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
                  {fdcBuildingStatus === '0' || fdcProjectStatus === '0' ? (
                    <Fragment>
                      {fdcProjectStatus === '0' ? (
                        <div className={styles.flexBoxButton}>
                          <Popover
                            content="已删除楼盘，无法新增房号。"
                            trigger="hover"
                          >
                            <Button disabled>新增房号</Button>
                          </Popover>
                        </div>
                      ) : (
                        <div className={styles.flexBoxButton}>
                          <Popover
                            content="已删除楼栋，无法新增房号。"
                            trigger="hover"
                          >
                            <Button disabled>新增房号</Button>
                          </Popover>
                        </div>
                      )}
                    </Fragment>
                  ) : (
                    <div className={styles.flexBoxButton}>
                      {authorityList[0] === 1000 ? (
                        <Button onClick={this.openHouse}>新增房号</Button>
                      ) : (
                        <Button onClick={() => this.authorityModal()}>
                          新增房号
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <Table
                className={styles.defineTable}
                columns={columns}
                rowKey="id"
                dataSource={this.props.fdcHouseList}
                pagination={pagination}
                // loading={this.context.loading.includes(actions.GET_MATCH_LIST)}
              />
            </div>
          ) : (
            ''
          )}
          {flag === 2 ? <Button>123</Button> : ''}
        </div>
        {/* 弹窗 */}
        <div>
          <Modal
            maskClosable={false}
            title="确定房号关联"
            visible={this.state.visiblePop}
            onOk={this.handleOkPop}
            onCancel={this.handleCancelPop}
          >
            <div className={styles.popupTitle}>
              <span>DC单元室号：</span>
              <span>{unitRoom}</span>
            </div>
            <div className={styles.popupTitle}>
              <span>FDC单元室号：</span>
              <span>{fdcUnitRoom}</span>
            </div>
            <div className={styles.popupTable}>
              <Table
                className={styles.defineTable}
                columns={columnsPopup}
                rowKey="id"
                dataSource={matchList}
                pagination={false}
                scroll={{ y: 500 }}
                loading={this.context.loading.includes(actions.GET_MATCH_LIST)}
              />
            </div>
          </Modal>
        </div>
        {/* 房号关联情况   在已处理的情况下才展示 fdcHouseId有值表示已处理 */}
        {fdcHouseId ? (
          <div className={styles.conditionAll}>
            <div className={styles.popupTitle}>
              <span className={styles.titleStyle} />
              <span className={styles.showTitle}>房号关联情况</span>
            </div>
            <div className={styles.popupTitle}>
              <span>DC单元室号：</span>
              <span>{unitRoomCondition}</span>
            </div>
            <div className={styles.popupTitle}>
              <span>FDC单元室号：</span>
              <span>{fdcUnitRoomCondition}</span>
            </div>
            <div className={styles.popupTable}>
              <Table
                className={styles.defineTable}
                columns={columnsCondition}
                rowKey="id"
                dataSource={conditionTable}
                pagination={false}
                scroll={{ y: 500 }}
                // loading={this.context.loading.includes(actions.GET_MATCH_LIST)}
              />
            </div>
          </div>
        ) : (
          ''
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
)(AuditBuildingEdit)
