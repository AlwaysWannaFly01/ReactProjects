import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import { connect } from 'react-redux'
import { parse } from 'qs'
import { Link } from 'react-router-dom'
import isNode from 'detect-node'
import { setSession, getSession, removeSession } from 'client/utils/assist'
import { IMAGE_URL } from 'client/config/index'
import {
  Breadcrumb,
  Icon,
  Row,
  Col,
  Button,
  Input,
  List,
  Popconfirm,
  message,
  Modal
} from 'antd'
import { pagePermission } from 'client/utils'
import showTotal from 'client/utils/showTotal'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import { breadReplyList, productSourceList } from './constant'
import styles from './Propertys.less'

const { TextArea } = Input

class PropertyReply extends Component {
  static propTypes = {
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getAnswerList: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    replyResponse: PropTypes.func.isRequired,
    answerList: PropTypes.array.isRequired
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }
  constructor(props) {
    super(props)
    const search = parse(props.location.search.substr(1))
    this.props.getAnswerList({ id: search.id, pageNum: 1, pageSize: 20 })
    this.state = {
      id: search.id,
      state:
        !isNode && getSession('replyState')
          ? getSession('replyState')
          : search.state,
      content: '您好，您反馈的楼盘已处理为：',
      visible: false,
      flag: false,
      visibleContent: false
    }
  }
  componentWillUnmount() {
    if (getSession('replyState')) {
      removeSession('replyState')
    }
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
  changeContent = e => {
    this.setState({
      content: e.target.value,
      visibleContent: !e.target.value,
      flag: !!(e.target.value.length > 255)
    })
  }

  openModal = (src, alt) => {
    this.setState({ visible: true, src, alt })
  }

  closeModal = () => {
    this.setState({ visible: false })
  }
  replyFunc(dealType) {
    const { id, content, flag, visibleContent } = this.state // eslint-disable-line
    const params = {
      id,
      dealType,
      content: dealType === '2002' ? '' : content
    }
    if (flag || visibleContent) {
      return
    }
    this.props.replyResponse(params, (data, msg, code) => {
      if (code === '200') {
        if (dealType === '2004' || dealType === '2003') {
          message.success('回复成功')
        }
        this.setState({ state: dealType, visibleContent: false })
        setSession('replyState', dealType)
        this.handleSearch(null, 1)
      } else {
        message.error(msg)
      }
    })
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
  renderForm() {
    const { answerList } = this.props
    const { visibleContent } = this.state
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
    const { state, flag } = this.state
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
              {pagePermission('fdc:dc:feedbackCenter:sale:answer') ? (
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
                      <Popconfirm
                        placement="right"
                        title="是否结束对话："
                        onConfirm={() => this.replyFunc('2004')}
                        onCancel={() => this.replyFunc('2003')}
                        okText="是"
                        cancelText="否"
                      >
                        <Button
                          style={{ marginTop: 15, marginBottom: 5 }}
                          type="danger"
                        >
                          提交回复
                        </Button>
                      </Popconfirm>
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
                      autosize={{ minRows: 4, maxRows: 6 }}
                      value={this.state.content}
                      onChange={this.changeContent}
                      className={styles.tabBottom}
                    />
                    {flag ? (
                      <div
                        style={{
                          color: '#f00',
                          marginBottom: 15,
                          marginTop: -5
                        }}
                      >
                        字数不能超过255！
                      </div>
                    ) : (
                      ''
                    )}
                    {visibleContent ? (
                      <div
                        style={{
                          color: '#f00',
                          marginBottom: 15,
                          marginTop: -5
                        }}
                      >
                        请输入回复内容，回复内容不能为空！
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </Col>
              </Row>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
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
                              onClick={() => {
                                this.openModal(`${IMAGE_URL}/${i}`, i)
                              }}
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
                      {/* <div>1111111：{item.remark}</div> */}
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
    const { src, alt, visible } = this.state
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>{this.renderForm()}</div>
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
)(PropertyReply)
