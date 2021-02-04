import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { TreeSelect } from 'antd'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

const SHOW_PARENT = TreeSelect.SHOW_PARENT
const { TreeNode } = TreeSelect


/**
 * @description 城市范围组件
 */
class CityRangeSingle extends Component {
  static propTypes = {
    getDefaultCity: PropTypes.func.isRequired,
    getAllCityList: PropTypes.func.isRequired,
    allCityList: PropTypes.array.isRequired,
    // defaultCity: PropTypes.array,
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
      cityValues:  [],
      isCity: props.value.isCity,
      // cityValues: props.value.cityValues || [],
      city: ''
    }
  }
  
  componentWillMount() {
    // this.props.getDefaultCity((data,code) =>{
    //   if(code === '200'){
    //     this.setState({city:data})
    //   }
    // })
  }
  
  componentDidMount() {
    let vm = this
    // eslint-disable-next-line array-callback-return
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
      this.props.getAllCityList(terr =>{
        console.log("this.city----",vm.state.city)
        if(vm.state.isCity){
          this.props.getDefaultCity((data,code) =>{
            if(code === '200'){
              // this.setState({city:data})
              let cityList = []
              //  eslint-disable-next-line
              terr.map(item => {
                if (item.children) {
                  //  eslint-disable-next-line
                  item.children.map((item2 =>{
                    if(item2.realValue === data){
                      // sessionStorage.setItem('FDC_CITY',this.props.defaultCity)
                      cityList.push(item2.value.toString())
                      vm.setState({cityValues:cityList})
                      vm.props.onCityRangeChange(cityList)
                      vm.props.onChange(cityList)
                      vm.toParent(cityList)
                      return true
                    }
                  }))
                }
              })
            }
          })
        }
      })
    }
   
  }
  componentWillReceiveProps(nextProps) {

  }
  
  toParent = cityList => {
    this.props.parent.getChildrenMsg(this, cityList)
  }
  
  
  handleCityChange = e => {
    let value = []
    if(typeof(e)==='string'){
      value.push(e)
    }else{
      value = e
    }
    if(typeof(e)==='undefined'){
      value = []
    }
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
    // const renderTreeNodes = data => {
    //   let vm = this
    //   data.map(item => {
    //     if (item.children) {
    //       item.disabled = true
    //       return (
    //           <TreeNode key={item.value} title={item.title} value={item.realValue} disabled={item.disabled}>
    //             {renderTreeNodes(item.children)}
    //           </TreeNode>
    //       )
    //     }
    //     return <TreeNode {...item} key={item.value} title={item.title} value={item.realValue} />
    //   })
    // }
    const {cityValues} = this.state
    
    const roleProps = {
      allowClear: true,
      showSearch: true,
      treeData: IsRole ? authorityCity : this.props.allCityList,
      value: cityValues, // 指定当前选中的条目
      onChange: this.handleCityChange,
      showCheckedStrategy: SHOW_PARENT,
      placeholder: "请选择",
      // allowClear: true,
      dropdownStyle: { maxHeight: '240px' },
      maxTagCount: 2,
      filterTreeNode: (inputValue, treeNode) =>
        treeNode.props.title.search(inputValue) > -1
    }
    
    
    return (
      <Fragment>
        {/*<TreeSelect*/}
        {/*    treeData*/}
        {/*    showSearch*/}
        {/*    style={{ width: '100%' }}*/}
        {/*    value={this.state.cityValues}*/}
        {/*    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}*/}
        {/*    placeholder={placeholder}*/}
        {/*    treeNodeFilterProp="label"*/}
        {/*    treeCheckable = 'true'*/}
        {/*    allowClear*/}
        {/*    treeDefaultExpandAll*/}
        {/*    onChange={values => this.handleCityChange(values)}*/}
        {/*>*/}
        {/*  {renderTreeNodes(treeData)}*/}
        {/*</TreeSelect>*/}
        <TreeSelect {...roleProps} />
      </Fragment>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(CityRangeSingle)
