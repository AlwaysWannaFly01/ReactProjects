import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, DatePicker } from 'antd'
import moment from 'moment'

const FormItem = Form.Item
const { MonthPicker } = DatePicker

/**
 * @author YJF
 * @param { startDate: moment, endDate: moment }
 * @description 城市均价月份
 */
class CityRangePicker extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    onChange: PropTypes.func,
    startDate: PropTypes.any,
    endDate: PropTypes.any
  }

  constructor(props) {
    super(props)

    this.state = {
      startDate: props.startDate || null,
      endDate: props.endDate || null
    }

    if (props.startDate && props.endDate) {
      props.onChange({ startDate: props.startDate, endDate: props.endDate })
    }
  }

  onStartChange = value => {
    this.onChange('startDate', 'endDate', value)
  }

  onEndChange = value => {
    this.onChange('endDate', 'startDate', value)
  }

  onChange = (field, otherField, value) => {
    if (field === 'startDate') {
      if (
        moment(value).format('YYYY-MM') >=
        moment(this.state.endDate)
          .subtract(5, 'months')
          .format('YYYY-MM')
      ) {
        this.setState(
          {
            [field]: value
          },
          () => {
            const { startDate, endDate } = this.state
            if (startDate && endDate) {
              this.props.form.setFieldsValue({ startDate, endDate })
              this.props.onChange({ startDate, endDate })
            } else {
              this.props.onChange(undefined)
            }
          }
        )
      } else {
        this.setState(
          {
            [field]: value,
            [otherField]: moment(value).add(
              field === 'startDate' ? '5' : '-5',
              'months'
            )
          },
          () => {
            const { startDate, endDate } = this.state
            if (startDate && endDate) {
              this.props.form.setFieldsValue({ startDate, endDate })
              this.props.onChange({ startDate, endDate })
            } else {
              this.props.onChange(undefined)
            }
          }
        )
      }
    }
    if (field === 'endDate') {
      if (
        moment(value).format('YYYY-MM') <=
        moment(this.state.startDate)
          .add(5, 'months')
          .format('YYYY-MM')
      ) {
        this.setState(
          {
            [field]: value
          },
          () => {
            const { startDate, endDate } = this.state
            if (startDate && endDate) {
              this.props.form.setFieldsValue({ startDate, endDate })
              this.props.onChange({ startDate, endDate })
            } else {
              this.props.onChange(undefined)
            }
          }
        )
      } else {
        this.setState(
          {
            [field]: value,
            [otherField]: moment(value).add(
              field === 'startDate' ? '5' : '-5',
              'months'
            )
          },
          () => {
            const { startDate, endDate } = this.state
            if (startDate && endDate) {
              this.props.form.setFieldsValue({ startDate, endDate })
              this.props.onChange({ startDate, endDate })
            } else {
              this.props.onChange(undefined)
            }
          }
        )
      }
    }
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
            <MonthPicker
              placeholder="开始日期"
              onChange={this.onStartChange}
              format="YYYY-MM-01"
              disabledDate={this.disabledStartDate}
              allowClear={false}
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
            <MonthPicker
              placeholder="结束日期"
              onChange={this.onEndChange}
              format="YYYY-MM-01"
              disabledDate={this.disabledEndDate}
              allowClear={false}
            />
          )}
        </FormItem>
      </Row>
    )
  }
}

export default Form.create()(CityRangePicker)
