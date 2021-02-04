/**
 * @description:操作权限即按钮权限控制按钮显示/隐藏
 * @param resourceCode
 * @author YJF
 */

import { Component } from 'react'
import PropTypes from 'prop-types'

import getAuths from './auths'

const authList = getAuths('Button')
/* eslint-disable */
const wrapAuthButton = ComposedComponent =>
  class WrapComponent extends Component {
    constructor(props) {
      super(props)
    }

    static propTypes = {
      resourceCode: PropTypes.string
    }

    render() {
      // console.log(
      //   authList,
      //   this.props.resourceCode,
      //   this.props,
      //   'authList',
      //   222
      // )
      // 是否能在权限列表中找到
      if (authList.length) {
        const hasAuth = authList.filter(
          item => item.resourceCode === this.props.resourceCode
        ).length
        return hasAuth ? ComposedComponent : null
      } else {
        return null
      }
    }
  }

export default wrapAuthButton
