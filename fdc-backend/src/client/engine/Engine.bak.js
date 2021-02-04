import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Immutable from 'immutable'
// import isNode from 'detect-node'
import { notification, Icon, LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import Header from 'client/components/header'
import SideMenu, { sideMenuSubject } from 'client/components/side-menu'
// import Breadcrumb from 'client/components/breadcrumb'
import PropertyRoutes from 'client/modules/property'
import DataRoutes from 'client/modules/data'
import HomeRoutes from 'client/modules/home'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './Engine.less'

class Engine extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getDefaultCity: PropTypes.func.isRequired,
    getMenuPermissions: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  static childContextTypes = {
    loading: PropTypes.instanceOf(Immutable.List)
  }

  constructor(props) {
    super(props)

    props.getDefaultCity()

    props.getMenuPermissions()

    this.state = {
      wrapCls: ''
    }
  }

  getChildContext() {
    const { loading } = this.props.model
    return {
      loading
    }
  }

  componentWillMount() {
    // if (isNode) {
    //   const { pathname } = this.props.location
    //   this.props.updateSideMenus({ pathname })
    // }
  }

  componentDidMount() {
    // 监听浏览器前进&后退事件
    // 根据对应路由地址，激活对应的按钮和菜单
    // this.context.router.history.listen(next => {
    //   const { pathname } = next
    //   if (pathname !== '/') {
    //     this.props.updateSideMenus({ pathname })
    //   }
    // })
    // this.props.updateSideMenus({ pathname: window.location.pathname })
    // const FDC_CITY = sessionStorage.getItem('FDC_CITY')
    // if (!FDC_CITY) {
    //   this.props.getDefaultCity()
    // }
    this.subscribe()
    this.bindEvent()
  }

  subscribe() {
    sideMenuSubject.subscribe(({ collapsed }) => {
      this.setState({
        wrapCls: collapsed ? styles.collapsed : ''
      })
    })
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
    const { wrapCls } = this.state

    return (
      <LocaleProvider locale={zhCN}>
        <div className={wrapCls}>
          <div className={styles.leftBlock}>
            <SideMenu location={location} />
          </div>
          <div className={styles.rightBlock}>
            <Header location={location} />
            <div className={styles.content}>
              <HomeRoutes />
              <PropertyRoutes />
              <DataRoutes />
            </div>
            {/* <div className={styles.breadcrumb}>
              <Breadcrumb pathname={location.pathname} />
            </div> */}
          </div>
        </div>
      </LocaleProvider>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(Engine)
