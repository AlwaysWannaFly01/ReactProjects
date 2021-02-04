import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Row, Button, Tabs, Message, Breadcrumb, Icon, Modal } from 'antd'
import { Link } from 'react-router-dom'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'

import router from 'client/router'
// import compareObj from 'client/utils/compareObj'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import ProInfoMerge from './ProInfo.merge'
import ProInfoSplit from './ProInfo.split'

import BaseInfoAddFirst from './BaseInfo.add.first'
import BaseInfoAddSecond from './BaseInfo.add.second'
import BaseInfoAddThird from './BaseInfo.add.third'
import BaseInfoForth from './BaseInfo.add.forth'
import BaseInfoFifth from './BaseInfo.add.fifth'

import styles from './BaseInfo.less'
const confirm = Modal.confirm
const TabPane = Tabs.TabPane

/**
 * 住宅 楼盘信息 新增
 * author: YJF
 */
class BaseInfoAdd extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    addProject: PropTypes.func.isRequired,
    editProject: PropTypes.func.isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    resetProjectDetail: PropTypes.func.isRequired,
    getSplitBuildList: PropTypes.func.isRequired,
    // getMergeProjectList: PropTypes.func.isRequired,
    restoreProjects: PropTypes.func.isRequired,
    projectDetail: PropTypes.instanceOf(Immutable.Map).isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    mergeProjects: PropTypes.func.isRequired,
    hasMatchProjectAlias:PropTypes.func.isRequired,
  }

  static contextTypes = {
    router: PropTypes.object
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { projectId = '', status = '1', cityId = '', cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      // 楼盘Id
      projectId,
      // 楼盘状态 1-正式楼盘
      status,
      // 当前激活Tab
      currentTabKey: '1',
      // 楼盘合并Modal
      mergeModalVisible: false,
      // 楼盘拆分Modal
      splitModalVisible: false,
      // 还原按钮loading
      restoreBtnLoading: false,
      MergeData:{},
      mergeBtnLoading:false,
      urlCityId: cityId,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const { projectId, cityId, cityName } = this.state // eslint-disable-line
    // console.log(cityName)
    this.cityId = sessionStorage.getItem('FDC_CITY')
    // this.cityName =
    //   JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || '北京市'
    this.cityIdInterval = setInterval(() => {
      let { urlCityId: finalCityId } = this.state
      if (!finalCityId) {
        finalCityId = sessionStorage.getItem('FDC_CITY')
      }
      if (finalCityId) {
        clearInterval(this.cityIdInterval)
        if (projectId) {
          this.props.getProjectDetail(projectId, finalCityId)
        }
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  componentWillUnmount() {
    this.props.resetProjectDetail()
  }

  onAddFirstRef = ref => {
    this.baseInfoAddFirst = ref
  }

  onAddSecondRef = ref => {
    this.baseInfoAddSecond = ref
  }

  onAddThirdRef = ref => {
    this.baseInfoAddThird = ref
  }

  onAddForthRef = ref => {
    this.baseInfoAddForth = ref
  }

  onAddFifthRef = ref => {
    this.baseInfoAddFifth = ref
  }

  handleChangeTabKey = key => {
    this.setState({
      currentTabKey: key
    })
  }

  // 带查询条件回到楼盘列表页面
  goBaseInfoList = () => {
    // 楼盘列表查询条件
    const baseInfoSearch = sessionStorage.getItem('BASE_INFO_SEARCH')
    this.props.history.push({
      pathname: router.RES_BASEINFO,
      search: baseInfoSearch
    })
  }

  handleSubmit = () => {
    const promiseArr = [this.baseInfoAddFirst.submitFirst()]
    if (this.baseInfoAddSecond) {
      promiseArr.push(this.baseInfoAddSecond.submitSecond())
    }
    if (this.baseInfoAddThird) {
      promiseArr.push(this.baseInfoAddThird.submitThird())
    }
    if (this.baseInfoAddForth) {
      promiseArr.push(this.baseInfoAddForth.submitForth())
    }
    if (this.baseInfoAddFifth) {
      promiseArr.push(this.baseInfoAddFifth.submitFifth())
    }
    Promise.all(promiseArr)
      .then(values => {
        let allValues = {}
        values.forEach(item => {
          allValues = Object.assign(allValues, item)
        })
        if (this.state.projectId) {
          // 前端比对代码
          const oldDataObj = this.props.projectDetail.toJS()
          // const postDataObj = compareObj(oldDataObj, allValues, 'baseInfo')
          // postDataObj.id = this.state.projectId
          // postDataObj.cityId = this.cityId
          // console.log(postDataObj, 33333333)

          // const postDataObj = Object.assign(oldDataObj, allValues)

          let postDataObj = {}
          const oldDataObjKeys = Object.keys(oldDataObj)
          const newDataObjKeys = Object.keys(allValues)
          oldDataObjKeys.forEach(item => {
            if (newDataObjKeys.includes(item)) {
              if (allValues[item] === null || allValues[item] === undefined) {
                postDataObj[item] = ''
              } else {
                postDataObj[item] = allValues[item]
              }
            } else {
              postDataObj[item] = oldDataObj[item]
            }
          })
          postDataObj = Object.assign(postDataObj, allValues)
          // 由于http请求会将undefined的字段不传递给后端，前端将字段转换为空字符串
          const postDataObjKeys = Object.keys(postDataObj)
          postDataObjKeys.forEach(item => {
            if (postDataObj[item] === undefined) {
              postDataObj[item] = ''
            }
          })

          // 删除后端编辑不接收的字段
          delete postDataObj.areaName
          delete postDataObj.sysStatus

          postDataObj.id = this.state.projectId
          postDataObj.cityId = sessionStorage.getItem('FDC_CITY')
          this.props.editProject(postDataObj, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('修改成功')
              // this.props.history.goBack()
              this.goBaseInfoList()
            } else {
              Message.error(message)
            }
          })
        } else {
          allValues.cityId = sessionStorage.getItem('FDC_CITY')
          this.props.addProject(allValues, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('新增成功')
              // this.props.history.goBack()
              this.props.history.push({
                pathname: router.RES_BASEINFO
              })
            } else {
              Message.error(message)
            }
          })
        }
      })
      .catch(errCode => {
        // console.log(errCode)
        this.setState({
          currentTabKey: errCode
        })
      })
  }
  
  getMergeModal(val){
    this.setState({
      MergeData:val
    },()=>{
      this.showConfirm()
    })
  }
  permissinBuild = () => {
    if (pagePermission('fdc:hd:residence:base:building:check')) {
      setTimeout(() => {
        this.context.router.history.push({
          pathname: router.RES_BUILD_INFO,
          search: `projectId=${this.state.projectId}&prjStatus=1`
        })
      }, 1500)
    }
  }
  
  onMergeClose = () => {
    this.ProInfoMerge.handleCloseModal()
  }
  onRef = ref => {
    this.ProInfoMerge = ref
  }
  
  ajaxMergeProjects = values =>{
    this.props.mergeProjects(values, data => {
      const { code, message, data:dataInside } = data
      this.setState({
        mergeBtnLoading: false
      })
      switch (Number(code)) {
        default:
          // 合并失败
          Message.warn(message)
          break
        case 200:
          this.handleCloseModal()
          // this.projectSelectRef.resetProjectSelect()
          // Message.success(message)
          switch (dataInside.tipAutoRelateMsgCode) {
            case 10001:
              Message.success(dataInside.tipAutoRelateMsg,1)
              break
            default:
              if(dataInside.tipAutoRelateMsg){
                Message.warn(dataInside.tipAutoRelateMsg,1)
              }
              break
          }
          setTimeout(()=>{
            switch (dataInside.tipMsgCode) {
              case 10001:
                this.setState({
                  buildingCounts:dataInside.buildingCounts
                })
                Message.warn(dataInside.tipMsg)
                break
                // case 10002:
                //   this.setState({
                //     buildingCounts:dataInside.buildingCounts
                //   })
                //   Message.warn(dataInside.tipMsg)
                //   break
              case 10003:
                Message.success(dataInside.tipMsg)
                // this.permissinBuild()
                break
                // case 10004:
                //   // 无相关数据
                //   Message.warn(dataInside.tipMsg)
                //   break
              default:
                // this.handleCloseModal()
                Message.warning(dataInside.tipMsg, 1.5)
                // this.permissinBuild()
                break
            }
          },1000)
          // 合并成功 详情页面刷新
          this.props.getProjectDetail(this.state.projectId, this.cityId)
          break
      }
    this.onMergeClose()
    })
}
  
  showConfirm = () => {
    const that = this
    let values = that.state.MergeData
    if(values.isDel==='1'){
      confirm({
        title: `是否将“${values.currentProject.replace(values.currentAreaName+' | ','')}（${values.currentAreaName}）”，作为相关楼盘名称，自动关联到“${values.projectName}（${values.areaName}）”。`,
        onOk() {
          values.isAutoRelate = 1
          that.ajaxMergeProjects(values)
          // that.props.hasMatchProjectAlias({
          //   projectName:values.projectName,
          //   cityId:that.cityId,
          //   areaId:values.srcAreaId
          // }, (res, msg, code) => {
          //   if(Array.isArray(res)){
          //     if(res.length>0){
          //       Message.error('该相关楼盘名称已经被正式楼盘关联',1)
          //     }else {
          //       Message.success('相关楼盘名称关联成功',1)
          //     }
          //   }
          //   setTimeout(()=>{
          //     values.isAutoRelate = 1
          //     that.ajaxMergeProjects(values)
          //   },1000)
          // })
        },
        onCancel() {
          values.isAutoRelate = 0
          that.ajaxMergeProjects(values)
        },
      })
    }else{
      values.isAutoRelate = 0
      that.ajaxMergeProjects(values)
    }
   
  }
  
  
  
  handleShowMergeModal = () => {
    this.setState({
      mergeModalVisible: true
    })
  }

  handleShowSplitModal = () => {
    const qry = {
      cityId: this.state.cityId || this.cityId,
      projectId: this.state.projectId
    }
    this.props.getSplitBuildList(qry)
    this.setState({
      splitModalVisible: true
    })
  }

  handleCloseModal = () => {
    this.setState({
      mergeModalVisible: false,
      splitModalVisible: false
    })
  }

  handleRestore = () => {
    this.setState({
      restoreBtnLoading: true
    })

    const ids = this.state.projectId
    const cityId = this.state.cityId || this.cityId
    this.props.restoreProjects(ids, cityId, res => {
      const { code, message } = res
      if (+code === 400) {
        Message.error(message)
      } else {
        this.goBaseInfoList()
        Message.success(res || '还原成功')
      }
      this.setState({
        restoreBtnLoading: false
      })
    })
  }

  /* eslint-disable */
  renderBreads() {
    const {
      areaId = '',
      areaName = '',
      projectName = ''
    } = this.props.projectDetail
    const { cityId, cityName } = this.state

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
        name: '住宅基础数据',
        icon: ''
      }
    ]
    if (this.state.projectId) {
      breadList.push(
        {
          key: 3,
          path: router.RES_BASEINFO,
          name: areaName,
          search: `areaId=${areaId}&cityId=${cityId}&cityName=${cityName}`
        },
        {
          key: 4,
          path: '',
          name:
            projectName && projectName.length > 10
              ? `${projectName.substr(0, 10)}...`
              : projectName
        }
      )
    } else {
      breadList.push({
        key: 3,
        path: '',
        name: '楼盘新增',
        icon: ''
      })
    }

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link to={{ pathname: item.path, search: item.search }}>
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

  renderTabs() {
    const {
      projectId,
      status,
      urlCityId,
      cityId,
      proviceId,
      cityName
    } = this.state

    return (
      <Tabs
        activeKey={this.state.currentTabKey}
        style={{ marginBottom: 24 }}
        onChange={this.handleChangeTabKey}
      >
        <TabPane tab="基本信息" key="1">
          <BaseInfoAddFirst
            onAddFirstRef={this.onAddFirstRef}
            projectId={projectId}
            projectStatus={status}
            urlCityId={urlCityId}
            cityId={cityId}
            cityName={cityName}
            // updateVisitCities={this.props.updateVisitCities}
          />
        </TabPane>
        <TabPane tab="楼盘地址" key="2">
          <BaseInfoAddSecond
            onAddSecondRef={this.onAddSecondRef}
            projectId={projectId}
            projectStatus={status}
            cityId={cityId}
          />
        </TabPane>
        <TabPane tab="小区详情" key="3">
          <BaseInfoAddThird
            onAddThirdRef={this.onAddThirdRef}
            projectId={projectId}
            projectStatus={status}
          />
        </TabPane>
        <TabPane tab="土地信息" key="4">
          <BaseInfoForth
            onAddForthRef={this.onAddForthRef}
            projectId={projectId}
            projectStatus={status}
          />
        </TabPane>
        <TabPane tab="小区规模" key="5">
          <BaseInfoFifth
            onAddFifthRef={this.onAddFifthRef}
            projectId={projectId}
            projectStatus={status}
          />
        </TabPane>
      </Tabs>
    )
  }

  renderButtons() {
    const {
      projectId, // 有--修改，没有--新增
      status,
      restoreBtnLoading,
      cityId,
      cityName
    } = this.state
    // const projectName = this.props.projectDetail.get('projectName')

    return (
      <Row>
        {status === '1' ? (
          <Fragment>
            {projectId ? (
              <Fragment>
                {pagePermission('fdc:hd:residence:base:dataSale:change') ? (
                  <Button
                    type="primary"
                    icon="save"
                    style={{ marginRight: 8 }}
                    onClick={this.handleSubmit}
                  >
                    保存
                  </Button>
                ) : (
                  ''
                )}
              </Fragment>
            ) : (
              <Fragment>
                {pagePermission('fdc:hd:residence:base:dataSale:add') ? (
                  <Button
                    type="primary"
                    icon="save"
                    style={{ marginRight: 8 }}
                    onClick={this.handleSubmit}
                  >
                    保存
                  </Button>
                ) : (
                  ''
                )}
              </Fragment>
            )}
          </Fragment>
        ) : null}
        {projectId ? (
          <span>
            <Link
              to={{
                pathname: router.RES_PRO_IMAGE,
                search: `projectId=${
                  this.state.projectId
                }&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:salePicture:check') ? (
                <Button style={{ marginRight: 8 }}>项目图片</Button>
              ) : (
                ''
              )}
            </Link>
            {pagePermission('fdc:hd:residence:base:realMatch:check') ? (
              <Link
                to={{
                  pathname: router.RES_PROJECT_RESOURCE,
                  search: `projectId=${
                    this.state.projectId
                  }&cityId=${cityId}&cityName=${cityName}`
                }}
              >
                <Button style={{ marginRight: 8 }}>楼盘配套</Button>
              </Link>
            ) : (
              ''
            )}

            <Link
              to={{
                pathname: router.RES_HOUSE_STAND,
                search: `projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:ratio:check') ? (
                <Button style={{ marginRight: 8 }}>房号系数差</Button>
              ) : (
                ''
              )}
            </Link>

            <Link
              to={{
                pathname: router.RES_HOUSE_STAND_THREE,
                search: `projectId=${projectId}&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {/* fdc:hd:residence:base:ratioThree:check */}
              {pagePermission('fdc:hd:residence:base:ratioThree:check') ? (
                <Button style={{ marginRight: 8 }}>房号系数差V3.0</Button>
              ) : (
                ''
              )}
            </Link>
            {status === '1' ? (
              <span>
                {pagePermission('fdc:hd:residence:base:dataSale:merge') ? (
                  <Button
                    style={{ marginRight: 8 }}
                    onClick={this.handleShowMergeModal}
                  >
                    楼盘合并
                  </Button>
                ) : (
                  ''
                )}
                {pagePermission('fdc:hd:residence:base:dataSale:split') ? (
                  <Button
                    style={{ marginRight: 8 }}
                    onClick={this.handleShowSplitModal}
                  >
                    楼盘拆分
                  </Button>
                ) : (
                  ''
                )}
              </span>
            ) : null}
            {status === '1' ? null : (
              <Fragment>
                {pagePermission('fdc:hd:residence:base:dataSale:return') ? (
                  <Button
                    style={{ marginRight: 8 }}
                    onClick={() => this.handleRestore()}
                    icon="reload"
                    type="primary"
                    loading={restoreBtnLoading}
                  >
                    楼盘还原
                  </Button>
                ) : (
                  ''
                )}
              </Fragment>
            )}
            {/* S 新增附属房屋 wy */}
            {pagePermission('fdc:hd:residence:base:attachedHouse:check') ? (
              <Link
                to={{
                  pathname: router.RES_HOUSE_ATTACHED,
                  search: `projectId=${
                    this.state.projectId
                  }&cityId=${cityId}&cityName=${cityName}`
                }}
              >
                <Button icon="" style={{ marginRight: 8 }}>
                  附属房屋
                </Button>
              </Link>
            ) : (
              ''
            )}

            {/* E 新增附属房屋 wy */}
            {pagePermission('fdc:hd:residence:base:building:check') ? (
              <Link
                to={{
                  pathname: router.RES_BUILD_INFO,
                  search: `projectId=${projectId}&prjStatus=${
                    this.state.status
                  }&cityId=${cityId}&cityName=${cityName}`
                }}
              >
                <Button icon="">转楼栋</Button>
              </Link>
            ) : (
              ''
            )}
          </span>
        ) : null}
      </Row>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div style={{ paddingBottom: 50 }} className={styles.container}>
          {this.renderTabs()}
          <div className={styles.btnCont}>{this.renderButtons()}</div>
        </div>
        <ProInfoMerge
          mergeModalVisible={this.state.mergeModalVisible}
          onCloseModal={this.handleCloseModal}
          projectId={this.state.projectId}
          sendBaseInfoAdd={this.getMergeModal.bind(this)}
          onMergeClose={this.onMergeClose}
          onRef={this.onRef}
        />
        <ProInfoSplit
          splitModalVisible={this.state.splitModalVisible}
          onCloseModal={this.handleCloseModal}
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
)(BaseInfoAdd)
