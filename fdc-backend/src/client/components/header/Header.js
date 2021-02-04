/* eslint-disable */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'
import isNode from 'detect-node'
import { Dropdown, Menu, Icon, Modal } from 'antd'

import routes from 'client/router/config'
import router from 'client/router'
import CityList from 'client/components/city-list'

import { modelSelector } from './selector'
import styles from './Header.less'

class Header extends Component {
  static propTypes = {
    userInfo: PropTypes.instanceOf(Immutable.Map),
    location: PropTypes.object.isRequired
    // defaultCity: PropTypes.instanceOf(Immutable.Map)
  }

  static defaultProps = {
    userInfo: Immutable.Map({})
  }

  constructor(props) {
    super(props)
    this.state = {
      menuSelectedKey: this.getSelectedMenu(props.location.pathname),

      // 城市列表组件是否可见
      cityListVisible: false
    }
    this.cityName = null
  }

  componentDidMount() {
    // if (!isNode) {
    //   this.cityName = '暂无城市权限'
    //   // const { cityName } = this.props.defaultCity
    //   const fdcCityInfo = sessionStorage.getItem('FDC_CITY_INFO')
    //   if (fdcCityInfo) {
    //     const { cityName } = JSON.parse(fdcCityInfo)
    //     this.cityName = cityName
    //   }
    // }
  }

  componentWillReceiveProps(nextProps) {
    console.log('nextProps: ',nextProps)
    const { pathname } = this.props.location
    const { pathname: nextPathname } = nextProps.location

    if (pathname !== nextPathname) {
      this.setState({
        menuSelectedKey: this.getSelectedMenu(nextPathname)
      })
    }
    const cityId = sessionStorage.getItem('FDC_CITY')
    if (!cityId) {
      this.cityName = '暂无城市权限'
    }
    if (nextPathname === router.HOME) {
      const cityId = sessionStorage.getItem('FDC_CITY')
      if (!cityId) {
        this.cityName = '暂无城市权限'
      }
    }
  }

  getSelectedMenu = pathname =>
    // 获取一级菜单
    pathname.split('/').slice(1)

  handleCityListRef = ref => {
    this.cityListRef = ref
  }

  handleChoseCity = () => {
    // const { cityName } = this.props.defaultCity
    if (this.cityName && this.cityName !== '暂无城市权限') {
      this.cityListRef.getVisitCities()
      this.setState({
        cityListVisible: true
      })
    } else {
      Modal.info({
        title: '暂无城市权限',
        content: <div>您尚未分配城市，请联系管理员分配城市权限!</div>
      })
    }
  }

  handleCloseCity = () => {
    this.setState({
      cityListVisible: false
    })
  }

  clearCitySession = () => {
    sessionStorage.removeItem('FDC_CITY')
    sessionStorage.removeItem('FDC_CITY_INFO')
  }

  renderMenu = () => {
    // 一级菜单展示
    let menuLevel1 = []
    if (!isNode) {
      if (!this.cityName || this.cityName === '暂无城市权限') {
        menuLevel1 = [
          {
            name: '工作台',
            key: 'home',
            path: '/home'
          }
        ]
      } else {
        menuLevel1 = routes
      }
    }

    return (
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={this.state.menuSelectedKey}
        style={{ lineHeight: '63px' }}
      >
        {menuLevel1.map(i =>
          (i.path === '/home' || (i.showMenu && pagePermission(i.resCode)) ? (
            <Menu.Item key={i.key}>
              <Link to={i.path}>{i.name}</Link>
            </Menu.Item>
          ) : (
            ''
          ))
        )}
      </Menu>
    )
  }

  renderUserMenu = () => (
    <Menu>
      {pagePermission('fdc:bm') ? (
        <Menu.Item key="0">
          <Link to="/backConfig">后台配置</Link>
        </Menu.Item>
      ) : (
        ''
      )}
      {pagePermission('fdc:am') ? (
        <Menu.Item key="1">
          <Link to="/authority">权限管理</Link>
        </Menu.Item>
      ) : (
        ''
      )}

      <Menu.Item key="2">
        <a href="/fdc/logout" onClick={this.clearCitySession}>
          退出登录
        </a>
      </Menu.Item>
    </Menu>
  )

  render() {
    const { userName } = this.props.userInfo
    // console.log(this.props.userInfo.toJS())

    if (!isNode) {
      this.cityName = '暂无城市权限'

      // const { cityName } = this.props.defaultCity
      const fdcCityInfo = sessionStorage.getItem('FDC_CITY_INFO')
      // 判断一次，在跳转到新页面的时候，要拿到本看到页面的sessionStorage WY

      if (fdcCityInfo) {
        const { cityName } = JSON.parse(fdcCityInfo)
        this.cityName = cityName
      }
    }

    // 只有在房产数据模块才显示地址切换 /property/
    let isPropertyModule = false
    const regRex = /^\/property/
    if (regRex.test(this.props.location.pathname)) {
      isPropertyModule = true
    }

    // 在有查看权限时，菜单展示 wy
    return (
      <div className={styles.wrap}>
        <div className={styles.logo}>房讯通FDC</div>
        <div className={styles.menuCont}>{this.renderMenu()}</div>
        {isPropertyModule ? (
          <div className={styles.userLocation} onClick={this.handleChoseCity}>
            <Icon type="environment-o" />
            {this.cityName}
          </div>
        ) : null}
        <div className={styles.user}>
          <div className={styles.avatar}>
            <Icon style={{fontSize:'16px'}} type="user" />
            {/* <img src={`/image${avatar}`} alt="" /> */}
          </div>
          <Dropdown overlay={this.renderUserMenu()} trigger={['click']}>
            <a className={styles.dropdown}>
              {userName} <Icon type="down" />
            </a>
          </Dropdown>
        </div>
        <CityList
          cityListVisible={this.state.cityListVisible}
          onCloseCityModal={this.handleCloseCity}
          location={this.props.location}
          onCityListRef={this.handleCityListRef}
        />
      </div>
    )
  }
}

export default connect(modelSelector)(Header)
