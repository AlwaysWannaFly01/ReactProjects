import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TreeSelect } from 'antd'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const SHOW_PARENT = TreeSelect.SHOW_PARENT

/**
 * @description 城市范围组件
 */
class CityRange extends Component {
  static propTypes = {
    getAllCityList: PropTypes.func.isRequired,
    allCityList: PropTypes.array.isRequired,
    cityValues: PropTypes.array,
    IsRole: PropTypes.string,
    onChange: PropTypes.func,
    onCityRangeChange: PropTypes.func.isRequired,
    getAuthorityCityList: PropTypes.func.isRequired, // 权限
    authorityCity: PropTypes.array.isRequired // 权限
  }

  constructor(props) {
    super(props)
    this.state = {
      cityValues: props.cityValues || []
    }
  }

  componentDidMount() {
    if (this.props.IsRole) {
      this.props.getAuthorityCityList(this.props.IsRole, (areaIds, list) => {
        const citys = []
        list.forEach(i => {
          citys.push(i)
          if (i.children && i.children.length) {
            i.children.forEach(j => {
              citys.push(j)
            })
          }
        })

        this.setState({
          // cityValues: areaIds.map(i => ({
          //   label: citys.find(j => j.key === i).label,
          //   value: i
          // }))
          cityValues: areaIds
        })
      })
    } else {
      this.props.getAllCityList()
    }
  }

  handleCityChange = value => {
    this.setState(
      {
        cityValues: value
      },
      () => {
        this.props.onCityRangeChange(value)
        this.props.onChange(value)
      }
    )
  }

  render() {
    const { IsRole, authorityCity } = this.props
    const roleProps = {
      treeData: IsRole ? authorityCity : this.props.allCityList,
      value: this.state.cityValues, // 指定当前选中的条目
      onChange: this.handleCityChange,
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      searchPlaceholder: '请选择',
      dropdownStyle: { maxHeight: '240px' },
      maxTagCount: 2,
      filterTreeNode: (inputValue, treeNode) =>
        treeNode.props.title.search(inputValue) > -1
    }

    return (
      <Fragment>
        <TreeSelect {...roleProps} />
      </Fragment>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(CityRange)
