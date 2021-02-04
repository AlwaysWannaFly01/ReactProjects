import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, DatePicker } from 'antd'
import moment from 'moment'

const FormItem = Form.Item

/**
 * @author YJF
 * @param { startDate: moment, endDate: moment }
 * @description 案例日期间隔日期不能大于6个月,超过6个月, 则自动赋值6个月的跨度
 */
class CaseRangePicker extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    startDate: PropTypes.any,
    endDate: PropTypes.any,
    onCaseDateRef: PropTypes.func
  }

  constructor(props) {
    super(props)

    props.onCaseDateRef(this)

    this.state = {
      startDate: props.startDate || null,
      endDate: props.endDate || null
    }

    if (props.startDate && props.endDate) {
      props.onChange({ startDate: props.startDate, endDate: props.endDate })
    }
  }

  onStartChange = value => {
    let { endDate } = this.state
    this.onChange('startDate', value)
    if (endDate) {
      const startDate = moment(value)
      // console.log(endDate.format('YYYY-MM-DD'))
      endDate = moment(endDate)
        .add(-6, 'months')
        .add(1, 'days')
      if (startDate.valueOf() < endDate.valueOf()) {
        // this.onEndChange(startDate.add(6, 'months').add(-1, 'days'))
        const endDateChange = startDate.add(6, 'months').add(-1, 'days')
        this.props.form.setFieldsValue({
          endDate: endDateChange
        })
        this.onChange('endDate', endDateChange)
      }
    }
  }

  onEndChange = value => {
    let { startDate } = this.state
    this.onChange('endDate', value)
    if (startDate) {
      const endDate = moment(value)
      startDate = moment(startDate)
        .add(6, 'months')
        .add(-1, 'days')
      if (startDate.valueOf() < endDate.valueOf()) {
        // this.onStartChange(endDate.add(-6, 'months').add(1, 'days'))

        const startDateChange = endDate.add(-6, 'months').add(1, 'days')
        this.props.form.setFieldsValue({
          startDate: startDateChange
        })
        this.onChange('startDate', startDateChange)
      }
    }
  }

  onChange = (field, value) => {
    // console.log(field, 'change', value)
    this.setState(
      {
        [field]: value
      },
      () => {
        const { startDate, endDate } = this.state
        if (startDate && endDate) {
          this.props.onChange({ startDate, endDate })
        } else {
          this.props.onChange(undefined)
        }
      }
    )
  }

  initialDate = (startDate, endDate) => {
    this.setState({
      startDate,
      endDate
    })
    this.props.form.setFieldsValue({
      startDate,
      endDate
    })
    this.props.onChange({ startDate, endDate })
  }

  disabledStartDate = currentDate => {
    const { endDate } = this.state
    if (!currentDate || !endDate) {
      return false
    }
    return currentDate.valueOf() > moment(endDate).valueOf()
  }

  disabledEndDate = currentDate => {
    const { startDate } = this.state
    if (!currentDate || !startDate) {
      return false
    }
    return currentDate.valueOf() < moment(startDate).valueOf()
  }

  render() {
    const { getFieldDecorator } = this.props.form

    const { startDate, endDate } = this.state
    // console.log(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))

    return (
      <Row style={{ display: 'flex', height: '50px' }}>
        <FormItem>
          {getFieldDecorator('startDate', {
            rules: [
              {
                required: true,
                message: '请选择开始日期'
              }
            ],
            initialValue: startDate
          })(
            <DatePicker
              disabledDate={this.disabledStartDate}
              // value={this.state.startDate}
              placeholder="开始日期"
              onChange={this.onStartChange}
            />
          )}
        </FormItem>
        <span style={{ margin: '0 15px', fontSize: '20px' }}>~</span>
        <FormItem>
          {getFieldDecorator('endDate', {
            rules: [
              {
                required: true,
                message: '请选择结束日期'
              }
            ],
            initialValue: endDate
          })(
            <DatePicker
              disabledDate={this.disabledEndDate}
              // value={this.state.endDate}
              placeholder="结束日期"
              onChange={this.onEndChange}
            />
          )}
        </FormItem>
      </Row>
    )
  }
}

export default Form.create()(CaseRangePicker)
