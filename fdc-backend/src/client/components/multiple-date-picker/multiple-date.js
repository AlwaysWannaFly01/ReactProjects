import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Tag, DatePicker } from 'antd'
import moment from 'moment'

import shallowEqual from 'client/utils/shallowEqual'

import styles from './multiple-date.less'

/**
 * @description 时间多选组件
 * @author YJF
 */
class MultipleDate extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.array,
    placeholder: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    pickerDisabled: PropTypes.bool
  }

  constructor(props) {
    super(props)

    this.state = {
      currentDate: undefined,

      dates: []
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.dates.length === 0) {
      this.setState({
        dates: nextProps.value
      })
    }
    if (!shallowEqual(this.props.value, nextProps.value)) {
      this.setState({
        dates: nextProps.value
      })
    }
  }

  // 时间选择
  handleDatePick = date => {
    const dateStr = moment(date).format('YYYY-MM-DD')
    const { dates } = this.state
    // 是否选择重复时间
    const hasRepeatDate = dates.find(date => date === dateStr)
    if (!hasRepeatDate) {
      this.setState(
        {
          dates: [...dates, dateStr]
        },
        () => {
          this.props.onChange(this.state.dates)
        }
      )
    }
  }

  // 时间删除
  handleRemoveDate = date => {
    const dates = this.state.dates.filter(item => item !== date)
    this.setState({
      dates
    })
    this.props.onChange(dates)
  }

  render() {
    const { width, placeholder, pickerDisabled } = this.props
    const { dates, currentDate } = this.state
    // console.log(dates, 111)

    return (
      <div className={classnames(styles.wrap, { width })}>
        {dates.length > 0 && (
          <div className={styles.selectTags}>
            {dates.map(date => (
              <Tag
                key={date}
                closable
                className={styles.dateTag}
                onClose={() => this.handleRemoveDate(date)}
              >
                {date}
              </Tag>
            ))}
          </div>
        )}
        <DatePicker
          value={currentDate}
          allowClear={false}
          placeholder={placeholder}
          style={{ width: '100%' }}
          format="YYYY-MM-DD"
          onChange={this.handleDatePick}
          disabled={pickerDisabled}
        />
      </div>
    )
  }
}

export default MultipleDate
