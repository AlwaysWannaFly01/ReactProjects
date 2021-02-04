import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import { modelSelector } from './selector'
import styles from './Dashboard.less'

class Dashboard extends Component {
  static propTypes = {
    userInfo: PropTypes.instanceOf(Immutable.Map)
  }
  static defaultProps = {
    userInfo: Immutable.Map({})
  }
  render() {
    const { userName } = this.props.userInfo
    return (
      <div>
        <div className={styles.processImg} />
        <div className={styles.processAuthor}>{userName}</div>
        <div className={styles.processWelcome}>欢迎使用房讯通数据中心系统</div>
      </div>
    )
  }
}

export default connect(modelSelector)(Dashboard)
