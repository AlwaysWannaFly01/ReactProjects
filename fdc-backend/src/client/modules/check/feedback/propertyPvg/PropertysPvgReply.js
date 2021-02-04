import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import { connect } from 'react-redux'
import { parse } from 'qs'
import { Link } from 'react-router-dom'
import router from 'client/router'
import isNode from 'detect-node'
import {
  setSession,
  getSession,
  removeSession,
  getCurMonth
} from 'client/utils/assist'
import { IMAGE_URL } from 'client/config/index'
import {
  Breadcrumb,
  Icon,
  Row,
  Col,
  Button,
  Input,
  List,
  Table,
  Popconfirm,
  message,
  Modal
} from 'antd'
import { pagePermission } from 'client/utils'
import moment from 'moment'
import showTotal from 'client/utils/showTotal'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './reducer'
import './sagas'

import { breadReplyList, productSourceList } from './content'
import styles from './PropertyPvg.less'

const { TextArea } = Input

class PropertysPvgReply extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getAnswerList: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    replyPvgResponse: PropTypes.func.isRequired,
    answerList: PropTypes.array.isRequired,
    getOneLineList: PropTypes.func.isRequired,
    oneLineList: PropTypes.array.isRequired,
    getAuthorityList: PropTypes.func.isRequired,
    authorityList: PropTypes.array.isRequired,
    useMonth: PropTypes.string
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }
  constructor(props) {
    super(props)
    const search = parse(props.location.search.substr(1))
    this.search = search
    this.state = {
      id: search.id,
      cityId: search.cityId,
      provinceId: search.provinceId,
      state:
        !isNode && getSession('replyState')
          ? getSession('replyState')
          : search.state,
      content: '您好，您反馈的楼盘价格已处理为:',
      flag: false,
      visibleContent: false
    }
  }
  componentDidMount() {
    const params = {
      cityId: this.search.cityId,
      projectId: this.search.projectId,
      useMonth: getCurMonth()
    }
    this.props.getOneLineList(params)
    this.props.getAnswerList({ id: this.search.id, pageNum: 1, pageSize: 20 })
    this.props.getAuthorityList({ cityId: this.search.cityId })

    setTimeout(() => {
      const { content } = this.state
      const [{ weightAvgPrice, avgPrice }] = this.props.oneLineList
      this.setState({
        content: `${content}  ${weightAvgPrice || (avgPrice || '0')}元/m²`
      })
    }, 800)
  }
  componentWillUnmount() {
    removeSession('replyState')
  }

  handleSearch = (e, pageNum) => {
    if (e) {
      e.preventDefault()
    }
    const { id } = this.state
    const params = {
      pageNum: pageNum || 1,
      pageSize: 20,
      id
    }
    this.props.getAnswerList(params)
  }
  openModal = (src, alt) => {
    this.setState({ visible: true, src, alt })
  }
  authorityModal() {
    Modal.error({
      title: '温馨提示：',
      content: '你没有该楼盘的城市权限，不允许下一步操作'
    })
  }
  projectStatusModal() {
    Modal.error({
      title: '温馨提示：',
      content: '该楼盘已被删除，不允许下一步操作'
    })
  }
  closeModal = () => {
    this.setState({ visible: false })
  }
  changeContent = e => {
    this.setState({
      content: e.target.value,
      visibleContent: !e.target.value,
      flag: !!(e.target.value.length > 255)
    })
  }
  replyFunc(dealType) {
    const { id, content } = this.state
    const { flag, visibleContent } = this.state
    const params = {
      id,
      dealType,
      content: dealType === '2002' ? '' : content
    }
    if (flag || visibleContent) {
      return
    }
    this.props.replyPvgResponse(params, (data, msg, code) => {
      if (code === '200') {
        switch (dealType) {
          case '2003':
            message.success('回复成功')
            break
          case '2004':
            message.success('回复成功')
            break
          default:
            break
        }
        this.setState({ state: dealType, visibleContent: false })
        setSession('replyState', dealType)
        this.handleSearch(null, 1)
      } else {
        message.error(msg)
      }
    })
  }
  saveSession() {
    sessionStorage.setItem('FDC_CITY', this.state.cityId)
    sessionStorage.setItem(
      'FDC_CITY_INFO',
      JSON.stringify({
        id: this.state.cityId,
        cityName: this.props.oneLineList[0].cityName,
        provinceId: this.state.provinceId
      })
    )
  }
  renderBreads() {
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadReplyList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? <Link to={item.path}>{item.name}</Link> : item.name}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }
  renderAnswer() {
    const { state, content, flag } = this.state
    const { visibleContent } = this.state
    if (`${this.props.oneLineList}`) {
      const [{ cityName, projectId }] = this.props.oneLineList
      this.cityName = cityName || ''
      this.projectId = projectId || ''
    }
    return (
      <div>
        {/* 已完成状态 判断 */}
        {state !== '2004' ? (
          <div>
            <Row
              style={{
                marginTop: 8
              }}
            >
              {pagePermission('fdc:dc:feedbackCenter:saleAvgPrice:answer') ? (
                <Fragment>
                  {state === '2001' ? (
                    <Col span={12}>
                      <Button
                        style={{ marginTop: 15, marginBottom: 5 }}
                        type="primary"
                        onClick={() => this.replyFunc('2002')}
                      >
                        开始回复
                      </Button>
                    </Col>
                  ) : (
                    ''
                  )}
                  {state === '2002' || state === '2003' ? (
                    <Col span={12}>
                      <div className={styles.pvgPopconfirm}>
                        <Popconfirm
                          placement="right"
                          title="是否结束对话："
                          onConfirm={() => this.replyFunc('2004')}
                          onCancel={() => this.replyFunc('2003')}
                          okText="是"
                          cancelText="否"
                        >
                          <Button
                            type="danger"
                            style={{ marginTop: 15, marginBottom: 5 }}
                          >
                            提交回复
                          </Button>
                        </Popconfirm>
                      </div>
                    </Col>
                  ) : (
                    ''
                  )}
                </Fragment>
              ) : (
                ''
              )}
            </Row>
            {/* 开始回复  待回复状态 */}
            {state !== '2001' ? (
              <Row
                style={{
                  marginTop: 8
                }}
              >
                <h2>回复内容：</h2>
                <Col span={24}>
                  <div className={styles.huifu}>
                    <TextArea
                      // placeholder="您好，您反馈的楼盘价格已处理为:"
                      autosize={{ minRows: 4, maxRows: 6 }}
                      value={content}
                      onChange={this.changeContent}
                      className={styles.tabBottom}
                    />
                  </div>
                  {flag ? (
                    <div
                      style={{ color: '#f00', marginBottom: 15, marginTop: -5 }}
                    >
                      字数不能超过255！
                    </div>
                  ) : (
                    ''
                  )}
                  {visibleContent ? (
                    <div
                      style={{ color: '#f00', marginBottom: 15, marginTop: -5 }}
                    >
                      请输入回复内容，回复内容不能为空！
                    </div>
                  ) : (
                    ''
                  )}
                </Col>
              </Row>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
        <div className={styles.pvgCityBox}>
          <span className={styles.pvgCity}>城市：</span>
          {this.cityName || '——'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <span className={styles.pvgCity}>楼盘ID：</span>
          {this.projectId || '——'}
        </div>
      </div>
    )
  }
  renderTable() {
    const { oneLineList, authorityList } = this.props
    const { id, cityId } = this.state
    const { provinceId, state } = this.state
    const columns = [
      {
        title: '行政区',
        width: 100,
        dataIndex: 'areaName'
      },
      {
        title: '楼盘名称',
        width: 100,
        dataIndex: 'projectName',
        render: projectName => (
          <div>
            {oneLineList[0].projectStatus === 1 ? (
              <span>{projectName}</span>
            ) : (
              <span style={{ color: '#f00' }}>{projectName}</span>
            )}
          </div>
        )
      },
      {
        title: '楼盘别名',
        width: 180,
        dataIndex: 'aliasName'
      },
      {
        title: '估价月份',
        width: 100,
        render: (_, { userMonth }) => {
          if (userMonth) {
            return moment(userMonth).format('YYYY-MM-DD')
          }
          return moment(this.props.useMonth).format('YYYY-MM-DD')
        },
        dataIndex: 'userMonth'
      },
      {
        title: '挂牌基准价',
        width: 100,
        render: (basePrice, { projectId, weightId }) => (
          <div>
            {oneLineList[0].projectStatus === 1 ? (
              <div>
                {authorityList[0] === 1000 ? (
                  <Fragment>
                    {pagePermission('fdc:hd:residence:average:list') ? (
                      <div onClick={() => this.saveSession()}>
                        <Link
                          to={{
                            pathname: router.RES_PRO_HOUSE_PRICE_DETAIL,
                            search: `projectId=${projectId ||
                              ''}&weightId=${weightId ||
                              ''}&tag=${0}&useMonth=${moment(
                              this.props.useMonth
                            ).format('YYYY-MM-DD')}&entry=1&cityId=${
                              this.state.cityId
                            }&state=${state}&id=${id}&feedCityId=${cityId}&feedProjectId=${
                              this.search.projectId
                            }&provinceId=${provinceId}`
                          }}
                        >
                          <span>{basePrice || '——'}</span>
                        </Link>
                      </div>
                    ) : (
                      <span>{basePrice || '——'}</span>
                    )}
                  </Fragment>
                ) : (
                  <div onClick={() => this.authorityModal()}>
                    <span>{basePrice || '——'}</span>
                  </div>
                )}
              </div>
            ) : (
              <div onClick={() => this.projectStatusModal()}>
                <span>{basePrice || '——'}</span>
              </div>
            )}
          </div>
        ),
        dataIndex: 'weightAvgPrice'
      },
      {
        title: '挂牌案例均价',
        width: 100,
        render: (price, { projectId, avgId }) => (
          <div>
            {oneLineList[0].projectStatus === 1 ? (
              <div>
                {authorityList[0] === 1000 ? (
                  <Fragment>
                    {pagePermission('fdc:hd:residence:average:list') ? (
                      <div onClick={() => this.saveSession()}>
                        <Link
                          to={{
                            pathname: router.RES_PRO_CASE_PRICE_DETAIL,
                            search: `projectId=${projectId}&avgId=${avgId ||
                              ''}&tag=${0}&useMonth=${moment(
                              this.props.useMonth
                            ).format(
                              'YYYY-MM-DD'
                            )}&entry=1&state=${state}&id=${id}&cityId=${cityId}&feedProjectId=${
                              this.search.projectId
                            }&provinceId=${provinceId}`
                          }}
                        >
                          <span>{price || '——'}</span>
                        </Link>
                      </div>
                    ) : (
                      <span>{price || '——'}</span>
                    )}
                  </Fragment>
                ) : (
                  <div onClick={() => this.authorityModal()}>
                    <span>{price || '——'}</span>
                  </div>
                )}
              </div>
            ) : (
              <div onClick={() => this.projectStatusModal()}>
                <span>{price || '——'}</span>
              </div>
            )}
          </div>
        ),
        dataIndex: 'avgPrice'
      },
      {
        title: '基案幅度',
        width: 100,
        render: percent => percent !== null && percent !== '' && `${percent}%`,
        dataIndex: 'rangePercent'
      },
      {
        title: '网站参考均价',
        width: 100,
        dataIndex: 'sourceSite'
      }
    ]
    return (
      <Table
        columns={columns}
        dataSource={
          oneLineList.length > 0 && oneLineList[0].isEffective === 1
            ? oneLineList
            : []
        }
        pagination={false}
        className={styles.defineTable}
        style={{ marginBottom: 50 }}
        locale={{
          emptyText: '当前FDC没有该楼盘名称，请核实后前往“房产数据”新增'
        }}
      />
    )
  }
  renderForm() {
    const { answerList } = this.props
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
      <div>
        <Row
          style={{
            marginTop: 8
          }}
        >
          <List
            itemLayout="vertical"
            size="small"
            pagination={pagination}
            loading={this.context.loading.includes(actions.GET_ANSWER_LIST)}
            dataSource={answerList}
            renderItem={item => (
              <List.Item key={item.title}>
                {!item.dealingName ? (
                  <Row>
                    <Col span="6">
                      <span className={styles.imgCustom} />
                      <span className={styles.names}>
                        {item.companyName},
                        {JSON.stringify(productSourceList).includes(
                          item.sourceProduct
                        )
                          ? productSourceList.filter(
                              i => i.value === item.sourceProduct
                            )[0].label
                          : item.sourceProduct}
                      </span>
                    </Col>
                    <Col span="12">
                      <Row>
                        <div>
                          于{item.crtTime.split('.')[0]}时，
                          <span className={styles.pvgCity}>反馈：</span>
                          {item.content}
                        </div>
                        {item.remark ? (
                          <div>
                            <span className={styles.pvgCity}>备注：</span>
                            {item.remark}
                          </div>
                        ) : (
                          ''
                        )}
                      </Row>
                      {item.images ? (
                        <Row className={styles.imgRow}>
                          {item.images.map(i => (
                            <div
                              key={i}
                              className={styles.imgDiv}
                              onClick={() =>
                                this.openModal(`${IMAGE_URL}/${i}`, i)
                              }
                            >
                              <img src={`${IMAGE_URL}/${i}`} alt={i} />
                            </div>
                          ))}
                        </Row>
                      ) : (
                        ''
                      )}
                    </Col>
                  </Row>
                ) : (
                  <Row
                    style={{
                      marginTop: 8
                    }}
                  >
                    <Col span={6}>
                      <span className={styles.imgGroup} />
                      <span className={styles.dealor}>{item.dealingId}</span>
                    </Col>
                    <Col span={12}>
                      <div>
                        于{item.crtTime.split('.')[0]}时，
                        <span className={styles.pvgCity}>回复：</span>
                      </div>
                      <div>{item.content}</div>
                      {/* <div>备注：{item.remark}</div> */}
                    </Col>
                  </Row>
                )}
              </List.Item>
            )}
          />
        </Row>
      </div>
    )
  }
  render() {
    const { visible, src, alt } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderAnswer()}
          {this.renderTable()}
          {this.renderForm()}
        </div>
        {/* 点击图片放大到原图的弹出层 */}
        <Modal
          visible={visible}
          footer={false}
          onCancel={this.closeModal}
          width="800px"
        >
          <img src={src} alt={alt} className={styles.modalImg} />
        </Modal>
      </div>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(PropertysPvgReply)
