import React, { Component } from 'react'
import PropTypes from 'prop-types'
import * as serverApi from 'client/api/common.api'
import * as baseInfoApi from 'client/api/baseInfo.api'
import { Select, Form } from 'antd'
import shallowEqual from 'client/utils/shallowEqual'

const FormItem = Form.Item
const { Option } = Select

/**
 * 住宅楼盘 comp
 * 模糊查询功能
 * 正式楼盘
 * author: YJF
 * selectDisabled: 不可编辑状态 1.楼盘已删除状态 2.有楼盘ID
 */
class ProjectSelect extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    projectSelectWidth: PropTypes.string,
    selectDisabled: PropTypes.bool,
    onProjectSelectRef: PropTypes.func,
    projectItem: PropTypes.object.isRequired,
    whichProject: PropTypes.object,
    cityId: PropTypes.string,
    noAreaName:PropTypes.bool
  }

  constructor(props) {
    super(props)

    if (props.onProjectSelectRef) {
      props.onProjectSelectRef(this)
    }

    this.state = {
      projectId: undefined,

      areaList: [],

      projectList: [],

      validateStatus: ''
    }

    this.timeout = null
    this.areaId = null
  }

  componentDidMount() {
    const { cityId } = this.props
    // console.log(this.props, cityId)
    this.cityId = cityId || sessionStorage.getItem('FDC_CITY')

    this.getAreaList()

    // console.log(this.props.projectItem)

    const { projectId } = this.props.projectItem
    if (projectId) {
      const qry = {
        projectId,
        cityId: this.cityId
      }
      this.getAllDetail(qry)
    }
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props.projectItem, nextProps.projectItem, 222)
    if (!shallowEqual(this.props.projectItem, nextProps.projectItem)) {
      const { projectId } = nextProps.projectItem
      // console.log(projectId, 333)
      if (projectId) {
        const qry = {
          projectId,
          cityId: this.cityId
        }
        this.getAllDetail(qry)
      }
    }
  }

  // 获取行政区列表
  async getAreaList() {
    try {
      const { data } = await serverApi.getAreaList(this.cityId)
      const areaList = data.map(({ id, areaName }) => ({ id, areaName }))
      this.setState({
        areaList
      })
    } catch (err) {
      console.log(err)
    }
  }

  // 获取楼盘详情 &&
  async getAllDetail(qry) {
    try {
      const { data } = await baseInfoApi.getAllDetail(qry)

      // console.log(this.props.whichProject.projectName)
      const projectNameError = this.props.whichProject
        ? this.props.whichProject.projectName
        : undefined
      // console.log(projectNameError, 222)
      /* eslint-disable */
      const { areaId, areaName, id: projectId, projectName } = data
      const projectNameE = projectNameError ? projectNameError : projectName
      const { onChange } = this.props
      const projectItem = {
        areaId,
        areaName,
        projectId,
        projectName
      }
      onChange(projectItem)
      this.setState({
        projectId
      })
      this.getProjectList(projectNameE, list => {
        this.setState({
          projectList: list
        })
      })
      // console.log(this.props.noAreaName);
      // if(this.props.noAreaName){
      //   this.props.form.setFieldsValue({
      //     projectName: projectNameError
      //         ? projectNameError
      //         : `${projectName}`
      //   })
      // }else {
      //   this.props.form.setFieldsValue({
      //     projectName: projectNameError
      //         ? projectNameError
      //         : `${areaName} | ${projectName}`
      //   })
      // }
      this.props.form.setFieldsValue({
        projectName: projectNameError
            ? projectNameError
            : `${areaName} | ${projectName}`
      })
     
    } catch (err) {
      console.log(err)
    }
  }

  async getProjectList(keyword, cb) {
    try {
      const searchBaseInfo = {
        pageNum: 1,
        pageSize: 10,
        cityId: this.cityId,
        keyword,
        statuses: 1
      }

      if (this.areaId) {
        searchBaseInfo.areaIds = this.areaId
      }

      // const { data } = await serverApi.getBaseInfoList(searchBaseInfo)
      const { data } = await serverApi.getBaseInfoSearch(searchBaseInfo)

      const projectList = []
      data.records.forEach(item => {
        projectList.push({
          // title: !this.props.noAreaName?`${item.areaName} | ${item.projectName}`:item.projectName,
          title: `${item.areaName} | ${item.projectName}`,
          key: item.id,
          value: item.id,
          areaId: item.areaId,
          areaName: item.areaName
        })
      })

      cb(projectList)
    } catch (err) {
      console.log(err)
    }
    return []
  }

  handleProjectList = (projectName, cb) => {
    this.setState({
      validateStatus: 'validating'
    })

    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.timeout = setTimeout(() => this.getProjectList(projectName, cb), 500)
  }

  handleProjectChange = value => {
    // console.log(value, 111)
    const { onChange } = this.props

    this.setState(
      {
        projectId: value
      },
      () => {
        if (onChange) {
          const selectedProject = this.state.projectList.filter(
            item => item.value === value
          )
          console.log(selectedProject)
          const { areaId, areaName,title } = selectedProject[0]

          const projectItem = {
            areaId,
            areaName,
            projectId: value,
            projectName: title
          }
          onChange(projectItem)
        }
      }
    )
  }

  handleProjectSearch = projectStr => {
    // 清空Select值
    this.setState({
      projectId: undefined
    })
    this.props.form.resetFields()
    const { onChange } = this.props
    if (onChange) {
      onChange(undefined)
    }

    if (projectStr) {
      let areaName
      let projectName
      // 如果有|，则判定有行政区；无则进行楼盘名称检索
      if (projectStr.indexOf('|') !== -1) {
        areaName = projectStr.split('|')[0].replace(/(^\s*)|(\s*)$/g, '')
        projectName = projectStr.split('|')[1].replace(/(^\s*)|(\s*)$/g, '')
      } else {
        projectName = projectStr
      }

      // 查询areaId
      if (areaName) {
        const areaIdArr = this.state.areaList.filter(
          item => item.areaName === areaName
        )
        if (areaIdArr.length) {
          this.areaId = areaIdArr[0].areaId
        }
      }

      if (projectName) {
        this.handleProjectList(projectName, list =>
          this.setState({
            projectList: list,
            validateStatus: ''
          })
        )
      }
    }
  }

  // 重置组件值
  resetProjectSelect = () => {
    this.props.form.resetFields()
    this.setState({
      projectId: undefined,
      projectList: []
    })
  }

  render() {
    const options = this.state.projectList.map(item => (
      <Option key={item.value} value={item.value}>
        {item.title}
      </Option>
    ))

    const {
      form: { getFieldDecorator }
    } = this.props

    return (
      <FormItem
        style={{
          marginBottom: 0,
          width: this.props.projectSelectWidth || '100%'
        }}
        validateStatus={this.state.validateStatus}
      >
        {getFieldDecorator('projectName', {
          initialValue: this.state.projectId
        })(
          <Select
            showSearch
            style={{ width: this.props.projectSelectWidth || '100%' }}
            placeholder="请输入行政区 | 楼盘名称"
            showArrow={false}
            filterOption={false}
            defaultActiveFirstOption={false}
            onChange={this.handleProjectChange}
            onSearch={this.handleProjectSearch}
            disabled={this.props.selectDisabled}
          >
            {options}
          </Select>
        )}
      </FormItem>
    )
  }
}

export default Form.create()(ProjectSelect)
