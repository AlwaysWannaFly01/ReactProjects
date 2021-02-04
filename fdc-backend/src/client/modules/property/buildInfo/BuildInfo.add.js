import React, { Component, Fragment } from 'react'
// import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Row, Message, Button, Tabs, Breadcrumb, Icon } from 'antd'
import { Link } from 'react-router-dom'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import moment from 'moment'

import router from 'client/router'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'

import BuildInfoAddFirst from './BuildInfo.add.first'
import BuildInfoAddSecond from './BuildInfo.add.second'
import BuildInfoAddThird from './BuildInfo.add.third'
import BuildInfoAddForth from './BuildInfo.add.forth'
import BuildInfoCopy from './BuildInfo.copy'

import styles from './BuildInfo.less'

const TabPane = Tabs.TabPane

/**
 * 住宅 楼栋 新增
 * author: YJF
 */
class BuildInfoAdd extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    restoreBuild: PropTypes.func.isRequired,
    getBuildDetail: PropTypes.func.isRequired,
    addBuild: PropTypes.func.isRequired,
    editBuild: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    resetBuildDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { projectId = '', buildId = '', cityId = '', cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      projectId,
      buildId,
      // 当前激活Tab
      currentTabKey: '1',
      // 是否已查询数据
      // tabKeyList: ['1'],
      // 复制楼栋Modal
      copyModalVisible: false,

      restoreBtnLoading: false,
      urlCityId: cityId,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      let finalCityId = this.state.urlCityId
      if (!finalCityId) {
        finalCityId = sessionStorage.getItem('FDC_CITY')
      }
      this.cityId = sessionStorage.getItem('FDC_CITY')
      if (finalCityId) {
        clearInterval(this.cityIdInterval)

        if (this.state.buildId) {
          const params = {
            cityId,
            buildId: this.state.buildId
          }
          // console.log(params)
          this.props.getBuildDetail(params, () => {})
        }
        // 获取楼盘详情
        this.props.getProjectDetail(this.state.projectId, finalCityId)
      }
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  componentWillUnmount() {
    this.props.resetBuildDetail()
  }

  onAddFirstRef = ref => {
    this.buildInfoAddFirst = ref
  }

  onAddSecondRef = ref => {
    this.buildInfoAddSecond = ref
  }

  onAddThirdRef = ref => {
    this.buildInfoAddThird = ref
  }

  onAddForthRef = ref => {
    this.buildInfoAddForth = ref
  }

  handleChangeTabKey = key => {
    // const { tabKeyList, buildId } = this.state
    // if (!tabKeyList.includes(key)) {
    //   if (buildId) {
    //     const params = {
    //       cityId: this.cityId,
    //       tabType: key,
    //       buildId: this.state.buildId
    //     }
    //     this.props.getBuildDetail(params, () => {
    //       this.setState({
    //         tabKeyList: [...this.state.tabKeyList, key]
    //       })
    //     })
    //   }
    // }

    this.setState({
      currentTabKey: key
    })
  }

  // 带查询条件回到楼栋列表页
  goBuildList = () => {
    const { cityId, cityName } = this.state
    // 楼栋列表查询条件 change wy
    const buildInfoSearch = localStorage.getItem('BUILD_INFO_SEARCH')
    const { projectId, prjStatus } = parse(buildInfoSearch)
    const initialSearch = `projectId=${projectId}&prjStatus=${prjStatus}&scopes=1&cityId=${cityId}&cityName=${cityName}`
    localStorage.setItem('BUILD_INFO_SEARCH', initialSearch)
    this.props.history.push({
      pathname: router.RES_BUILD_INFO,
      search: initialSearch
    })
  }

  handleSubmit = () => {
    const { cityId } = this.state
    const promiseArr = [this.buildInfoAddFirst.submitFirst()]
    if (this.buildInfoAddSecond) {
      promiseArr.push(this.buildInfoAddSecond.submitSecond())
    }
    if (this.buildInfoAddThird) {
      promiseArr.push(this.buildInfoAddThird.submitThird())
    }
    if (this.buildInfoAddForth) {
      promiseArr.push(this.buildInfoAddForth.submitForth())
    }
    Promise.all(promiseArr)
      .then(values => {
        let allValues = {}
        values.forEach(item => {
          allValues = Object.assign(allValues, item)
        })

        if (this.state.buildId) {
          // 前端比对代码
          const { buildDetail } = this.props.model
          const oldDataObj = buildDetail.toJS()
          // const postDataObj = compareObj(oldDataObj, allValues, 'buildInfo')

          // 处理时间格式字段 🌶️
          if (oldDataObj.buildDate) {
            oldDataObj.buildDate = moment(oldDataObj.buildDate).format(
              'YYYY-MM-DD'
            )
          }
          if (oldDataObj.onboardDate) {
            oldDataObj.onboardDate = moment(oldDataObj.onboardDate).format(
              'YYYY-MM-DD'
            )
          }

          // console.log(oldDataObj, allValues, 22222)

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
          // 删除后端编辑不接收的字段 🌶️
          delete postDataObj.modTime
          delete postDataObj.prjStatus
          delete postDataObj.status
          delete postDataObj.ownerShip
          delete postDataObj.photoCount

          // 由于http请求会将undefined的字段不传递给后端，前端将字段转换为空字符串
          const postDataObjKeys = Object.keys(postDataObj)
          postDataObjKeys.forEach(item => {
            if (postDataObj[item] === undefined) {
              postDataObj[item] = ''
            }
          })

          postDataObj.id = this.state.buildId
          postDataObj.cityId = sessionStorage.getItem('FDC_CITY') || cityId
          postDataObj.projectId = this.state.projectId
          this.props.editBuild(postDataObj, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('修改成功')
              this.goBuildList()
              // this.props.history.goBack()
            } else {
              Message.error(message)
            }
          })
        } else {
          allValues.cityId = sessionStorage.getItem('FDC_CITY')
          allValues.projectId = this.state.projectId
          this.props.addBuild(allValues, res => {
            const { code, message } = res
            if (+code === 200) {
              Message.success('新增成功')
              // this.props.history.goBack()
              // this.props.history.push({
              //   pathname: router.RES_BUILD_INFO,
              //   search: `projectId=${
              //     this.state.projectId
              //   }&prjStatus=${1}&cityId=${cityId}&cityName=${cityName}`
              // })
              this.goBuildList()
            } else {
              Message.error(message)
            }
          })
        }
      })
      .catch(errCode => {
        this.setState({
          currentTabKey: errCode
        })
      })
  }

  handleRestoreBuild = () => {
    // const buildingIds = JSON.stringify([this.state.buildId])
    this.setState({
      restoreBtnLoading: true
    })

    const data = {
      cityId: this.cityId,
      buildingIds: this.state.buildId,
      projectId: this.state.projectId
    }
    this.props.restoreBuild(data, res => {
      /* eslint-disable */
      const { tipsCode, tipsMsg, successNum, failNum } = res
      switch (tipsCode) {
        case 1003:
          Message.warn(
            `有重名楼栋，还原成功${successNum}条，还原失败${failNum}条,请再次确认`
          )
          break
        case 1002:
          Message.error(tipsMsg)
          break
        case 1001:
          Message.success(tipsMsg)
          this.goBuildList()
          break
        default:
          break
      }
      this.setState({
        restoreBtnLoading: false
      })
    })
  }

  handleCopyBuildInfo = () => {
    this.setState({
      copyModalVisible: true
    })
  }

  handleCloseCopyModal = () => {
    this.setState({
      copyModalVisible: false
    })
  }

  renderBreads() {
    const {
      areaId,
      areaName,
      id,
      projectName,
      sysStatus
    } = this.props.model.get('projectDetail')

    let buildBreadTitle = '楼栋新增'
    if (this.state.buildId) {
      buildBreadTitle = this.props.model.get('buildDetail').get('buildingName')
      buildBreadTitle =
        buildBreadTitle && buildBreadTitle.length > 10
          ? `${buildBreadTitle.substr(0, 10)}...`
          : buildBreadTitle
    }
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
        path: '',
        name: buildBreadTitle
      }
    ]

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

  renderTabs() {
    const { buildId, projectId, urlCityId, cityId, cityName } = this.state

    const buildDetail = this.props.model.get('buildDetail')

    // 判断楼栋状态 默认为正式楼栋
    let buildStatus = true
    const { prjStatus = 1, status = 1 } = buildDetail

    if (prjStatus === 1) {
      buildStatus = status === 1
    } else {
      buildStatus = false
    }

    // 如果是新增
    if (!buildId) {
      buildStatus = true
    }

    return (
      <Tabs
        activeKey={this.state.currentTabKey}
        style={{ marginBottom: 24 }}
        onChange={this.handleChangeTabKey}
      >
        <TabPane tab="基本信息" key="1">
          <BuildInfoAddFirst
            onAddFirstRef={this.onAddFirstRef}
            projectId={projectId}
            buildId={buildId}
            buildStatus={buildStatus}
            urlCityId={urlCityId}
            cityId={cityId}
            cityName={cityName}
          />
        </TabPane>
        <TabPane tab="楼栋地址" key="2">
          <BuildInfoAddSecond
            onAddSecondRef={this.onAddSecondRef}
            buildId={buildId}
            buildStatus={buildStatus}
          />
        </TabPane>
        <TabPane tab="楼栋系数" key="3">
          <BuildInfoAddThird
            onAddthirdRef={this.onAddThirdRef}
            buildId={buildId}
            buildStatus={buildStatus}
          />
        </TabPane>
        <TabPane tab="楼栋规模" key="4">
          <BuildInfoAddForth
            onAddForthRef={this.onAddForthRef}
            buildId={buildId}
            buildStatus={buildStatus}
          />
        </TabPane>
      </Tabs>
    )
  }

  renderButtons() {
    const {
      projectId,
      buildId,
      restoreBtnLoading,
      cityId,
      cityName
    } = this.state

    const buildDetail = this.props.model.get('buildDetail')
    // const totalFloorNum = buildDetail.get('totalFloorNum')

    // 判断楼栋状态 默认为正式楼栋
    let buildStatus = true
    const { prjStatus = 1, status = 1 } = buildDetail
    if (prjStatus === 1) {
      buildStatus = status === 1
    } else {
      buildStatus = false
    }

    // 如果是新增
    if (!buildId) {
      buildStatus = true
    }

    // 楼栋还原状态按钮
    let restoreBtnStatus = false
    if (prjStatus === 1) {
      restoreBtnStatus = status === 0
    }

    return (
      <Row>
        {buildStatus ? (
          <Fragment>
            {buildId ? (
              <Fragment>
                {pagePermission('fdc:hd:residence:base:building:change') ? (
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
                {pagePermission('fdc:hd:residence:base:building:add') ? (
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
        {buildId ? (
          <span>
            <Link
              to={{
                pathname: router.RES_PRO_IMAGE,
                search: `projectId=${projectId}&buildingId=${buildId}&cityId=${cityId}&cityName=${cityName}`
              }}
            >
              {pagePermission('fdc:hd:residence:base:buildingPicture:check') ? (
                <Button style={{ marginRight: 8 }}>楼栋图片</Button>
              ) : (
                ''
              )}
            </Link>
            {buildStatus &&
            pagePermission('fdc:hd:residence:base:building:copy') ? (
              <Button
                style={{ marginRight: 8 }}
                onClick={this.handleCopyBuildInfo}
              >
                楼栋复制
              </Button>
            ) : null}
            {restoreBtnStatus ? (
              <Fragment>
                {pagePermission('fdc:hd:residence:base:building:return') ? (
                  <Button
                    style={{ marginRight: 8 }}
                    onClick={this.handleRestoreBuild}
                    loading={restoreBtnLoading}
                  >
                    楼栋还原
                  </Button>
                ) : (
                  ''
                )}
              </Fragment>
            ) : null}
            {pagePermission('fdc:hd:residence:base:roomNum:check') ? (
              <Link
                to={{
                  pathname: router.RES_HOUSE_NUM,
                  search: `projectId=${projectId}&buildId=${buildId}&cityId=${cityId}&cityName=${cityName}`
                }}
              >
                <Button>转房号</Button>
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
    const { projectId, buildId } = this.state
    const buildDetail = this.props.model.get('buildDetail')

    return (
      <div style={{ paddingBottom: 16 }}>
        {this.renderBreads()}
        <div className={styles.container}>
          {this.renderTabs()}
          <div className={styles.btnCont}>{this.renderButtons()}</div>
        </div>
        <BuildInfoCopy
          copyModalVisible={this.state.copyModalVisible}
          onCloseCopyModal={this.handleCloseCopyModal}
          projectId={projectId}
          buildId={buildId}
          buildDetail={buildDetail}
        />
      </div>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(BuildInfoAdd)
