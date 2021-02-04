import React, { Component } from 'react'
import { DatePicker, message } from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'

class CaseRangePicker extends Component {
  static propTypes = {
    closable: PropTypes.bool,
    initBeginTime: PropTypes.any,
    maxDate: PropTypes.number.isRequired,
    currentTime: PropTypes.any,
    onChange: PropTypes.func.isRequired
  }
  static defaultProps = {
    closable: true
  }
  constructor(props) {
    super(props)
    // this.halfYear = 6 * this.month // 最大日期间隔不能超过半年
    // const currentTime = new Date().getTime() // 当天的时间
    this.month = 30 * 24 * 60 * 60 * 1000
    this.state = {
      startValue: props.initBeginTime ? moment(props.initBeginTime) : null,
      endValue: props.currentTime ? moment(props.currentTime) : null,
      endOpen: false
    }
  }

  componentDidMount() {
    this.props.onChange([this.state.startValue, this.state.endValue])
  }

  componentWillReceiveProps(props) {
    this.setState({
      startValue: props.initBeginTime ? moment(props.initBeginTime) : null,
      endValue: props.currentTime ? moment(props.currentTime) : null
    })
  }

  // 选择开始日期
  onStartChange = value => {
    this.setState({
      startValue: value,
      endValue: null
    })
    if (!value) {
      this.props.onChange([null, null])
    }
  }

  // 选择结束日期
  onEndChange = value => {
    if (!this.state.startValue) {
      message.warning('请先选择导入开始日期')
      return
    }
    if (!value) {
      this.setState({
        startValue: null
      })
      this.props.onChange([null, null])
    }
    this.setState({
      endValue: value
    })
  }
  // 设置可以选择的时间
  disabledEndDate = endValue => {
    const startValue = this.state.startValue
    if (!endValue || !startValue) {
      return false
    }
    const startTime = new Date(startValue).getTime()
    const endTime = new Date(endValue).getTime()
    const maxTime = startTime + this.props.maxDate
    return endTime <= startTime || endTime > maxTime
  }

  handleStartOpenChange = open => {
    Promise.resolve().then(() => {
      const { startValue } = this.state
      if (!startValue) {
        return false
      }
      if (!open) {
        this.setState({ endOpen: true })
      }
      return false
    })
  }

  handleEndOpenChange = open => {
    if (!this.state.startValue) {
      message.warning('请先选择导入开始日期')
      return
    }
    Promise.resolve().then(() => {
      const { startValue, endValue } = this.state
      let endTime = endValue
      if (!endValue) {
        endTime = new Date(startValue).getTime() + this.month
        endTime = moment(endTime)
        this.setState({
          endValue: endTime
        })
      }
      this.props.onChange([startValue, endTime])
    })
    this.setState({ endOpen: open })
  }

  render() {
    const { startValue, endValue, endOpen } = this.state
    return (
      <div className="fdc-date-range-picker-wrap">
        <DatePicker
          format="YYYY-MM-DD"
          allowClear={this.props.closable}
          value={startValue}
          placeholder="开始日期"
          onChange={this.onStartChange}
          onOpenChange={this.handleStartOpenChange}
        />
        <span style={{ margin: '0 15px', fontSize: '20px' }}>~</span>
        <DatePicker
          disabledDate={this.disabledEndDate}
          allowClear={this.props.closable}
          format="YYYY-MM-DD"
          value={endValue}
          placeholder="结束日期"
          onChange={this.onEndChange}
          open={endOpen}
          onOpenChange={this.handleEndOpenChange}
        />
      </div>
    )
  }
}

export default CaseRangePicker
