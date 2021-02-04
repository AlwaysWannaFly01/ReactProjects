import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { Modal, Tabs, Tag, Spin, Message, Select } from 'antd'
import Immutable from 'immutable'

import shallowEqual from 'client/utils/shallowEqual'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './CityList.less'

const TabPane = Tabs.TabPane
const Option = Select.Option

class CityList extends Component {
  static propTypes = {
    cityListVisible: PropTypes.bool.isRequired,
    onCloseCityModal: PropTypes.func.isRequired,
    getVisitCities: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    location: PropTypes.object.isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    defaultCity: PropTypes.instanceOf(Immutable.Map).isRequired,
    onCityListRef: PropTypes.func.isRequired,
    setCityList: PropTypes.func.isRequired,
    getCityList: PropTypes.func.isRequired,
    searchVisitCity: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    props.onCityListRef(this)

    const { provinceId } = props.defaultCity

    this.timeout = null
    this.currentValue = null

    this.state = {
      activeKey: 'province',

      // 选中的省份
      checkedProvinceId: provinceId,
      checkedProvinceName: '',
      // 选中的城市
      checkedCityId: '',
      checkedCityName: '',

      loading: false,

      // 城市检索Value
      citySearchValue: undefined,
      searchCityList: []
    }
  }

  componentWillReceiveProps(nextProps) {
    const provinceList = this.props.model.get('provinceList')
    const nextPropvinceList = nextProps.model.get('provinceList')
    if (provinceList !== nextPropvinceList) {
      let provinceId = ''
      let cityId = ''
      let cityName = ''
      const { defaultCity } = this.props
      // 如果从 reducer 中获取不到，则从 sessionStorage 中获取
      if (defaultCity) {
        provinceId = defaultCity.get('provinceId')
        cityId = defaultCity.get('id')
        cityName = defaultCity.get('cityName')
      }

      let fdcCityInfo = sessionStorage.getItem('FDC_CITY_INFO')
      if (fdcCityInfo) {
        fdcCityInfo = JSON.parse(fdcCityInfo)
        if (!shallowEqual(defaultCity.toJS(), fdcCityInfo)) {
          provinceId = fdcCityInfo.provinceId
          cityId = fdcCityInfo.id
          cityName = fdcCityInfo.cityName
        }
      }

      // 判断城市是否全市
      let isAllCities = false
      nextPropvinceList.forEach(item => {
        if (item.get('id') === provinceId) {
          isAllCities = item.get('allCities')
        }
      })
      if (isAllCities) {
        this.props.getCityList(provinceId)
      } else {
        this.props.setCityList({ provinceId })
      }

      let checkedProvinceName = ''
      // 获取对应省份
      const checkedProvince = nextPropvinceList.filter(
        item => item.get('id') === provinceId
      )
      if (checkedProvince.size) {
        checkedProvinceName = checkedProvince.get('0').get('provinceName')
      }
      this.setState({
        checkedProvinceId: provinceId,
        checkedProvinceName,
        checkedCityId: cityId,
        checkedCityName: cityName
      })
    }
  }

  getSearchCityList = (value, cb) => {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    this.currentValue = value
    this.timeout = setTimeout(() => {
      this.props.searchVisitCity(value, res => {
        cb(res)
      })
    }, 500)
  }

  getVisitCities = () => {
    this.setState({
      loading: true
    })
    this.props.getVisitCities(() => {
      this.setState({
        loading: false
      })
    })
  }

  async handleChoseProvince(province) {
    const { id, provinceName, allCities } = province
    if (allCities) {
      await this.props.getCityList(id)
    } else {
      await this.props.setCityList({ provinceId: id })
    }

    // 🌶️
    setTimeout(() => {
      const checkedCityName = this.props.model.get('defaultCityName')

      this.setState({
        checkedProvinceId: id,
        checkedProvinceName: provinceName,
        checkedCityName,
        activeKey: 'city'
      })
    }, 300)
  }

  handleChoseCity = city => {
    const { id, cityName } = city
    const { pathname } = this.props.location
    const pathNameArr = pathname.split('/')
    const params = {
      cityId: id,
      cityName
    }
    const { id: curCityId } = this.props.defaultCity
    if (id !== curCityId) {
      this.props.updateVisitCities(params, res => {
        if (res) {
          const { code = 200, message = '' } = res
          if (code === 400) {
            Message.warn(message)
          } else {
            // 打开新的标签页 只能跳转到房产数据模块的三级菜单
            const pathname3level = pathNameArr
              .filter((_, index) => index < 4)
              .join('/')
            // console.log(pathname3level)
            // window.open(`/property/res/base-info?cityId=${id}`)
            window.open(`${pathname3level}?cityId=${id}&cityName=${cityName}`)
          }
        } else {
          // 打开新的标签页
          const pathname3level = pathNameArr
            .filter((_, index) => index < 4)
            .join('/')
          // console.log(pathname3level)
          window.open(`${pathname3level}?cityId=${id}&cityName=${cityName}`)
          // window.open(`/property/res/base-info?cityId=${id}`)
        }
      })
    }
    this.props.onCloseCityModal()
  }

  handleTabChange = activeKey => {
    this.setState({
      activeKey
    })
  }

  handleSearchCity = value => {
    // console.log(value)
    if (value === '') {
      value = ' '
    }
    this.setState({
      citySearchValue: value
    })
    this.getSearchCityList(value, data =>
      this.setState({ searchCityList: data || [] })
    )
  }

  handleChangeCityInput = value => {
    this.setState({
      citySearchValue: value
    })
  }

  handleSearchCitySelect = value => {
    if (value) {
      const selectCity = this.state.searchCityList.filter(
        item => item.id === value
      )[0]
      // console.log(selectCity)
      this.handleChoseCity(selectCity)
    }
  }

  renderRecentCity() {
    const { checkedCityId } = this.state
    const generalCities = this.props.model.get('generalCities')

    return (
      <div style={{ marginBottom: 16 }}>
        常用城市：
        {generalCities.size > 0 ? (
          generalCities.slice(0, 10).map(item => (
            <Tag
              key={item.get('id')}
              className={classnames(
                styles.tagItem,
                checkedCityId === item.get('id') ? styles.active : ''
              )}
              onClick={() => this.handleChoseCity(item)}
            >
              {item.get('cityName')}
            </Tag>
          ))
        ) : (
          <span>暂无</span>
        )}
      </div>
    )
  }

  renderCitySearch() {
    const options = this.state.searchCityList.map(d => (
      <Option key={d.id} value={d.id}>
        {d.cityName}
      </Option>
    ))

    return (
      <div className={styles.citySearch}>
        <div className={styles.citySearchFont}>城市检索：</div>
        <div className={styles.searchCont}>
          <Select
            showSearch
            showArrow={false}
            filterOption={false}
            value={this.state.citySearchValue}
            onSearch={this.handleSearchCity}
            onChange={this.handleChangeCityInput}
            onSelect={this.handleSearchCitySelect}
            notFoundContent="暂无数据"
            style={{ width: '100%' }}
            placeholder="请选择城市"
          >
            {options}
          </Select>
        </div>
      </div>
    )
  }

  renderProvinceList() {
    const { checkedProvinceId } = this.state
    const provinceList = this.props.model.get('provinceList')
    return (
      <div>
        {provinceList.map(province => (
          <Tag
            key={province.get('id')}
            className={classnames(
              styles.tagItem,
              checkedProvinceId === province.get('id') ? styles.active : ''
            )}
            onClick={() => this.handleChoseProvince(province)}
          >
            {province.get('provinceName')}
          </Tag>
        ))}
      </div>
    )
  }

  renderCityList() {
    const { checkedCityId } = this.state
    const cityList = this.props.model.get('cityList')

    return (
      <div className={styles.cityListCont}>
        {cityList.map(city => (
          <Tag
            key={city.get('id')}
            className={classnames(
              styles.tagItem,
              checkedCityId === city.get('id') ? styles.active : ''
            )}
            onClick={() => this.handleChoseCity(city)}
          >
            {city.get('cityName')}
          </Tag>
        ))}
      </div>
    )
  }

  render() {
    const { checkedProvinceName, checkedCityName, loading } = this.state

    return (
      <Modal
        title="城市选择"
        visible={this.props.cityListVisible}
        footer={false}
        onCancel={this.props.onCloseCityModal}
      >
        <Spin spinning={loading}>
          {this.renderRecentCity()}
          {this.renderCitySearch()}
          <Tabs
            activeKey={this.state.activeKey}
            type="card"
            onChange={this.handleTabChange}
          >
            <TabPane tab={checkedProvinceName} key="province">
              {this.renderProvinceList()}
            </TabPane>
            <TabPane tab={checkedCityName} key="city">
              {this.renderCityList()}
            </TabPane>
          </Tabs>
        </Spin>
      </Modal>
    )
  }
}

export default connect(
  modelSelector,
  containerActions
)(CityList)
