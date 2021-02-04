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
import { pagePermission } from 'client/utils'
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
      oldOpenKeys: [],
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
   * 只保留前面3级，以便菜单展开
   */
  getOpenKeys = key => {
    let key3level = key
    let selectedKeys = key
    const keyArr = key.split('/')
    if (keyArr.length > 4) {
      key3level = keyArr.filter((_, index) => index < 4).join('/')
      selectedKeys = key3level
    }
    let openKey = []
    this.state.handledMenuData.forEach(newMenu => {
      if (newMenu.path === key3level) {
        openKey = newMenu.parentKeys ? newMenu.parentKeys : []
      }
    })

    return { openKey, selectedKeys }
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
    const { openKey, selectedKeys } = this.getOpenKeys(pathname)
    this.setState({
      openKey,
      selectedKeys
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
    const { collapsed, oldOpenKeys } = this.state
    this.setState({
      oldOpenKeys: this.state.openKey
    })
    // 侧边栏收起来的状态
    if (!collapsed) {
      this.setState({
        openKey: []
      })
    } else {
      this.setState({
        openKey: oldOpenKeys
      })
    }

    sideMenuSubject.next({
      collapsed: !collapsed
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

  // hanleMenuOpen = openKey => {
  //   const latestOpenKey = openKey.find(
  //     key => this.state.openKey.indexOf(key) === -1
  //   )
  //   const { pathname } = this.props.location
  //   if (pathname.indexOf(latestOpenKey) === -1) {
  //     this.setState({ openKey })
  //   } else {
  //     this.setState({
  //       openKey: latestOpenKey ? [latestOpenKey] : []
  //     })
  //   }
  // }

  renderSubMenu = menus =>
    menus.map(menu => {
      const { type, IconComp } = this.getIconComp(menu)
      // 回退2.12
      if (menu.children) {
        const title = (
          <span>
            <IconComp key="1" type={type} />
            <span key="2">{menu.name}</span>
          </span>
        )
        return pagePermission(menu.resCode) ? (
          <SubMenu key={menu.path} title={title}>
            {this.renderSubMenu(menu.children)}
          </SubMenu>
        ) : (
          ''
        )
      }
      // return pagePermission(menu.resCode) && menu.name !== '区域租售比' && menu.name !== '楼盘评级规则' ? (
      return pagePermission(menu.resCode)  ? (
        <Menu.Item key={menu.path}>
          {menu.path ? (
            <Link to={menu.path}>
              <Icon type={menu.icon} />
              <span>{menu.name}</span>
            </Link>
          ) : (
            menu.name
          )}
        </Menu.Item>
      ) : (
        ''
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

    const {
      openKey,
      selectedKeys,
      collapsed // eslint-disable-line
    } = this.state

    return (
      <div
        className={classnames({
          [styles.wrap]: true,
          [styles.collapsed]: collapsed
        })}
      >
        <div className={styles.menu}>
          <Menu
            theme="dark"
            mode="inline"
            style={{ height: '100%' }}
            openKeys={openKey}
            selectedKeys={[selectedKeys]}
            onClick={this.handleMenuChange}
            onOpenChange={this.hanleMenuOpen}
            inlineCollapsed={collapsed}
          >
            {this.renderSubMenu(menu2list)}
          </Menu>
        </div>
        {/* <button className={styles.collapse} onClick={this.handleCollapse}>
          {
            {
              true: <Icon type="double-right" />,
              false: <Icon type="double-left" />
            }[collapsed]
          }
        </button> */}
        <button onClick={this.handleCollapse} className={styles.collapse}>
          <Icon type={this.state.collapsed ? 'double-right' : 'double-left'} />
        </button>
      </div>
    )
  }
}

export default SideMenu
export { sideMenuSubject }
