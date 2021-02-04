import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import isNode from 'detect-node'
import { notification, Icon, LocaleProvider} from 'antd'
//LocaleProvider 已经废弃
import zhCN from 'antd/lib/locale-provider/zh_CN'
import moment from 'moment'
import 'moment/locale/zh-cn'
import { parse } from 'qs'

import { Switch, Route, Redirect } from 'react-router-dom'

import router from 'client/router'
import Header from 'client/components/header'
import HomeRoutes from 'client/modules/home'
import getAuths from 'client/utils/auth/auths'
import shallowEqual from 'client/utils/shallowEqual'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import EngineBasic from './Engine.basic'

import munuList from './menuList.json'

moment.locale('zh-cn')

// console.log(munuList)

class Engine extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getDefaultCity: PropTypes.func.isRequired,
    setDefaultCity: PropTypes.func.isRequired,
    getMenuPermissions: PropTypes.func.isRequired
    // history: PropTypes.object.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  static childContextTypes = {
    loading: PropTypes.instanceOf(Immutable.List)
  }

  constructor(props) {
    super(props)
    props.getMenuPermissions()

    const { cityId = '' } = parse(props.location.search.substr(1))

    this.state = {
      cityId
    }
  }

  getChildContext() {
    const { loading } = this.props.model
    return {
      loading
    }
  }

  componentDidMount() {
    this.bindEvent()

    if (!isNode) {
      // 如果是切换城市 新开浏览器标签
      // 只有在房产数据模块才有城市切换 /property/
      let isPropertyModule = false
      const regRex = /^\/property/
      if (regRex.test(this.props.location.pathname)) {
        isPropertyModule = true
      }
      // if (
      //   this.state.cityId &&
      //   this.props.location.pathname === router.RES_BASEINFO
      // ) {
      if (this.state.cityId && isPropertyModule) {
        sessionStorage.clear()
      }
      this.city = sessionStorage.getItem('FDC_CITY')
      // console.log(this.city, 111111)
      if (!this.city) {
        // 获取城市权限 1.城市权限大于菜单权限
        this.props.getDefaultCity()
        // this.props.history.push({
        //   pathname: router.HOME
        // })
      }
    }

    localStorage.setItem('FDC_MENU_AUTH', JSON.stringify(munuList))
    getAuths(JSON.stringify(munuList))
  }

  componentWillReceiveProps(nextProps) {
    // const { defaultCity } = this.props.model
    const { defaultCity: nextDefaultCity } = nextProps.model
    let fdcCityInfo = sessionStorage.getItem('FDC_CITY_INFO')

    if (fdcCityInfo) {
      fdcCityInfo = JSON.parse(fdcCityInfo)
      if (!shallowEqual(nextDefaultCity.toJS(), fdcCityInfo)) {
        // console.log(
        //   nextDefaultCity.toJS(),
        //   fdcCityInfo,
        //   !shallowEqual(nextDefaultCity.toJS(), fdcCityInfo),
        //   222
        // )
        this.props.setDefaultCity(fdcCityInfo)
      }
    }
  }

  bindEvent() {
    window.addEventListener('offline', () => {
      notification.open({
        message: '网络有异常，请检查网络后再试',
        duration: 0,
        icon: <Icon type="exclamation-circle" style={{ color: '#f04134' }} />
      })
    })
  }

  render() {
    const { location } = this.props
    return (
      <LocaleProvider locale={zhCN}>
        {/*国际化组件。已废弃，请使用 ConfigProvider 代替。*/}
        <div>
          <Header location={location} />
          <Switch>
            <Route
              path={router.INDEX}
              exact
              render={() => <Redirect to={router.HOME} />}
            />
            {/*exact属性为true时路径中的hash值必须和path完全一致才渲染对应的组件*/}
            <Route path={router.HOME} component={HomeRoutes} />
            <Route path={router.PROPERTY} component={EngineBasic} />
            <Route path={router.DATA} component={EngineBasic} />
            <Route path={router.CHECK} component={EngineBasic} />
            <Route path={router.BGCONFIG} component={EngineBasic} />
          </Switch>
        </div>
      </LocaleProvider>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(Engine)
