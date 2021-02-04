import React, { Component } from 'react'
import { compose } from 'redux'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { pagePermission } from 'client/utils'
import { Form, Row, Button, Breadcrumb, Icon } from 'antd'
import layout from 'client/utils/layout'
import router from 'client/router'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './busInfo.less'

const FormItem = Form.Item

/**
 * 住宅 楼盘列表
 * author: YJF
 */
class BusInfo extends Component {
  static propTypes = {
    // location: PropTypes.object.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    // eslint-disable-next-line
    super(props)
    // const { cityId, cityName } = parse(props.location.search.substr(1))

    this.state = {
      cityId: '',
      cityName: ''
    }
  }

  componentDidMount() {
    // eslint-disable-next-line
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      cityId: sessionStorage.getItem('FDC_CITY') || '',
      cityName:
        JSON.parse(sessionStorage.getItem('FDC_CITY_INFO')).cityName || ''
    })
  }
  renderBreads() {
    const breadList = [
      {
        key: 1,
        path: '',
        name: '商业',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_BASEINFO,
        name: '商业基础数据'
      }
    ]

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link
                to={{
                  pathname: item.path,
                  search: item.search
                }}
              >
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderFrom() {
    return (
      <Form className={styles.FormContent}>
        <FormItem labelCol={layout(6, 2)} wrapperCol={layout(18, 22)}>
          <Row style={{ marginBottom: 0 }}>
            <Link
              to={{
                pathname: router.BUS_BUSINFO_IMPORT,
                search: `importType=${1212124}&cityId=${
                  this.state.cityId
                }&cityName=${this.state.cityName}`
              }}
            >
              {pagePermission('fdc:hd:bus:busInfo:import') ? (
                <Button
                  style={{ marginRight: 16 }}
                  icon="upload"
                  type="primary"
                >
                  导入
                </Button>
              ) : (
                ''
              )}
            </Link>
          </Row>
        </FormItem>
      </Form>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>{this.renderFrom()}</div>
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(BusInfo)
