import React, { Component } from 'react'
import PropTypes from 'prop-types'

import SideMenu, { sideMenuSubject } from 'client/components/side-menu'
import CheckRoutes from 'client/modules/check'
import PropertyRoutes from 'client/modules/property'
import DataRoutes from 'client/modules/data'
import BackconfigRoutes from 'client/modules/backConfig'
import Authority from 'client/modules/authority'

import styles from './Engine.less'

class EngineBasicLayout extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  }

  constructor() {
    super()

    this.state = {
      wrapCls: ''
    }
  }

  componentDidMount() {
    this.subscribe()
  }

  subscribe() {
    sideMenuSubject.subscribe(({ collapsed }) => {
      this.setState({
        wrapCls: collapsed ? styles.collapsed : ''
      })
    })
  }

  render() {
    const { location } = this.props
    const { wrapCls } = this.state

    return (
      <div className={wrapCls}>
        <div className={styles.leftBlock}>
          <SideMenu location={location} />
        </div>
        <div className={styles.rightBlock}>
          <div className={styles.content}>
            <PropertyRoutes />
            <DataRoutes />
            <CheckRoutes />
            <BackconfigRoutes />
            <Authority />
          </div>
        </div>
      </div>
    )
  }
}

export default EngineBasicLayout
