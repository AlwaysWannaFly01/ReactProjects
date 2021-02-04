/**
 * 左侧导航栏
 */
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import PropTypes from 'prop-types'
import { Menu, Icon } from 'antd'
import Rx from 'rxjs'
import IconFont from 'client/components/iconfont'
import config from 'client/router/config'

import styles from './SideMenu.less'

const { SubMenu } = Menu

const sideMenuSubject = new Rx.Subject()

class SideMenu extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  constructor() {
    super()
    // 经过处理的Menus
    const handledMenuData = this.handleMenusData(config)
    this.state = {
      collapsed: false,
      handledMenuData,
      openKey: [],
      selectedKeys: ''
    }
  }

  componentDidMount() {
    const { pathname } = this.props.location
    this.updateActiveSideMenu(pathname)

    // 监听浏览器前进&后退事件
    // 根据对应路由地址，激活对应的按钮和菜单
    this.context.router.history.listen(next => {
      const { pathname } = next
      if (pathname !== '/') {
        this.updateActiveSideMenu(pathname)
      }
    })

    this.subscribe()
  }

  getIconComp({ icon, iconfont }) {
    if (icon) {
      return {
        type: icon,
        IconComp: Icon
      }
    }
    if (iconfont) {
      return {
        type: iconfont,
        IconComp: IconFont
      }
    }
    return {
      type: iconfont || icon,
      IconComp: IconFont
    }
  }

  /*
   * 查找openKeys
   * 即 当前key 的 所有父级 key 集合
   * 没有父级 则 []
   */
  getOpenKeys = key => {
    let openKeys = []
    this.state.handledMenuData.forEach(newMenu => {
      if (newMenu.path === key) {
        openKeys = newMenu.parentKeys ? newMenu.parentKeys : []
      }
    })
    return openKeys
  }

  /*
   *  梳理Menu的数据结构
   *  将N层嵌套改造成深度为1的Array，添加parentKeys: Array字段
   */
  handleMenusData = menus => {
    const newMenus = menus.concat([])
    let len = newMenus.length
    for (let i = 0; i < len; i += 1) {
      const menu = newMenus[i]
      if (menu.children && menu.children.length !== 0) {
        const childMenu = menu.children
        for (let j = 0; j < childMenu.length; j += 1) {
          if (menu.parentKeys) {
            childMenu[j].parentKeys = menu.parentKeys.concat([menu.path])
          } else {
            childMenu[j].parentKeys = [menu.path]
          }
          newMenus[len + j] = childMenu[j]
        }
        len = newMenus.length
      }
    }
    return newMenus
  }

  /*
   * 激活选中的SideMenu
   */
  updateActiveSideMenu = pathname => {
    const openKey = this.getOpenKeys(pathname)
    this.setState({
      openKey,
      selectedKeys: pathname
    })
  }

  subscribe() {
    sideMenuSubject.subscribe(({ collapsed }) => {
      this.setState({
        collapsed
      })
    })
  }

  handleCollapse = () => {
    const collapsed = !this.state.collapsed
    sideMenuSubject.next({
      collapsed
    })
  }

  handleMenuChange = menu => {
    const { key } = menu
    this.setState({
      selectedKeys: key
    })
  }

  hanleMenuOpen = openKey => {
    this.setState({
      openKey
    })
  }

  renderSubMenu = menus =>
    menus.map(menu => {
      const { type, IconComp } = this.getIconComp(menu)
      if (menu.children) {
        const title = [
          <IconComp key="1" type={type} />,
          <span key="2">{menu.name}</span>
        ]
        return (
          <SubMenu key={menu.path} title={title}>
            {this.renderSubMenu(menu.children)}
          </SubMenu>
        )
      }
      return (
        <Menu.Item key={menu.path}>
          {menu.path ? (
            <Link to={menu.path}>
              <Icon type={menu.icon} />
              {menu.name}
            </Link>
          ) : (
            menu.name
          )}
        </Menu.Item>
      )
    })

  render() {
    const {
      location: { pathname }
    } = this.props

    // 2级 菜单
    let menu2list = []
    config.forEach(item => {
      if (pathname.match(item.path)) {
        menu2list = item.children
      }
    })
    const { collapsed } = this.state

    return (
      <div
        className={classnames({
          [styles.wrap]: true,
          [styles.collapsed]: collapsed
        })}
      >
        <div className={styles.logo}>房讯通FDC</div>
        <div className={styles.menu}>
          <Menu
            mode="inline"
            theme="dark"
            style={{ height: '100%' }}
            openKeys={this.state.openKey}
            selectedKeys={[this.state.selectedKeys]}
            onClick={this.handleMenuChange}
            onOpenChange={this.hanleMenuOpen}
            inlineCollapsed={collapsed}
          >
            {this.renderSubMenu(menu2list)}
          </Menu>
        </div>
        <button className={styles.collapse} onClick={this.handleCollapse}>
          {
            {
              true: <Icon type="double-right" />,
              false: <Icon type="double-left" />
            }[collapsed]
          }
        </button>
      </div>
    )
  }
}

export default SideMenu
export { sideMenuSubject }
