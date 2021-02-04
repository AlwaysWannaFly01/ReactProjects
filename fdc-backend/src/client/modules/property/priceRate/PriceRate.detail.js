import React, { Component } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Breadcrumb, Icon, Form } from 'antd'
import Immutable from 'immutable'
import router from 'client/router'
import { parse } from 'qs'
// import { pagePermission } from 'client/utils'

import { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './PriceRate.less'
// import { breadListDetail } from './constant.js'

/*
 * 价格比值 / 详情
 */
class PriceRateDetail extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    // form: PropTypes.object.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getPriceRateDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)
    // eslint-disable-next-line
    const { projectId, cityId, cityName } = parse(
      props.location.search.substr(1)
    )

    this.state = {
      projectId,
      cityId,
      cityName
    }
  }

  componentDidMount() {
    const { projectId, cityId, cityName } = this.state
    // console.log(cityId)
    this.props.getPriceRateDetail({ id: projectId, cityId })
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  renderBreads() {
    const { cityId, cityName } = this.state
    const breadListDetail = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_PRO_PROJECT_AVG,
        name: '楼盘价格'
      },
      {
        key: 3,
        path: router.RES_PRO_PRICE_RATE,
        search: `?cityId=${cityId}&cityName=${cityName}`,
        name: '价格比值'
      },
      {
        key: 4,
        path: '',
        name: '详情'
      }
    ]
    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadListDetail.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link to={{ pathname: item.path, search: item.search }}>
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

  renderForm() {
    const priceRateDetailList = this.props.model
      .get('priceRateDetailList')
      .toJS()
    return (
      <div>
        <div>
          <span className={styles.formBrick} />
          <span className={styles.formTitle}>
            {priceRateDetailList.projectName} ({priceRateDetailList.areaName})
          </span>
        </div>
        <div>
          {/* 第一行 */}
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>价格比值：</span>
              <span>{priceRateDetailList.priceRate}</span>
            </div>
            <div className={styles.formPiece}>
              <span>所有房号标准系数平均值：</span>
              <span>{priceRateDetailList.standardRateAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>楼盘所有楼层差平均值：</span>
              <span>{priceRateDetailList.floorDiffAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>城市所有楼层差平均值：</span>
              <span>{priceRateDetailList.cityFloorDiffAvg}</span>
            </div>
          </div>
          {/* 第二行 低层 */}
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>低层价格比值：</span>
              <span>{priceRateDetailList.lowLayerPriceRate}</span>
            </div>
            <div className={styles.formPiece}>
              <span>低层房号标准系数平均值：</span>
              <span>{priceRateDetailList.lowLayerStandardRateAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>楼盘低层楼层差平均值：</span>
              <span>{priceRateDetailList.lowLayerFloorDiffAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>城市低层楼层差平均值：</span>
              <span>{priceRateDetailList.cityLowLayerFloorDiffAvg}</span>
            </div>
          </div>
          {/* 第三行 多层 */}
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>多层价格比值：</span>
              <span>{priceRateDetailList.multiLayerPriceRate}</span>
            </div>
            <div className={styles.formPiece}>
              <span>多层房号标准系数平均值：</span>
              <span>{priceRateDetailList.multiLayerStandardRateAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>楼盘多层楼层差平均值：</span>
              <span>{priceRateDetailList.multiLayerFloorDiffAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>城市多层楼层差平均值：</span>
              <span>{priceRateDetailList.cityMultiLayerFloorDiffAvg}</span>
            </div>
          </div>
          {/* 第四行 小高层 */}
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>小高层价格比值：</span>
              <span>{priceRateDetailList.smallHighLayerPriceRate}</span>
            </div>
            <div className={styles.formPiece}>
              <span>小高层房号标准系数平均值：</span>
              <span>{priceRateDetailList.smallHighLayerStandardRateAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>楼盘小高层楼层差平均值：</span>
              <span>{priceRateDetailList.smallHighLayerFloorDiffAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>城市小高层楼层差平均值：</span>
              <span>{priceRateDetailList.citySmallHighLayerFloorDiffAvg}</span>
            </div>
          </div>
          {/* 第五行 高层 */}
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>高层价格比值：</span>
              <span>{priceRateDetailList.highLayerPriceRate}</span>
            </div>
            <div className={styles.formPiece}>
              <span>高层房号标准系数平均值：</span>
              <span>{priceRateDetailList.highLayerStandardRateAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>楼盘高层楼层差平均值：</span>
              <span>{priceRateDetailList.highLayerFloorDiffAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>城市高层楼层差平均值：</span>
              <span>{priceRateDetailList.cityHighLayerFloorDiffAvg}</span>
            </div>
          </div>
          {/* 第六行 超高层 */}
          <div className={styles.formContent}>
            <div className={styles.formPiece}>
              <span>超高层价格比值：</span>
              <span>{priceRateDetailList.superHighLayerPriceRate}</span>
            </div>
            <div className={styles.formPiece}>
              <span>超高层房号标准系数平均值：</span>
              <span>{priceRateDetailList.superHighLayerStandardRateAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>楼盘超高层楼层差平均值：</span>
              <span>{priceRateDetailList.superHighLayerFloorDiffAvg}</span>
            </div>
            <div className={styles.formPiece}>
              <span>城市超高层楼层差平均值：</span>
              <span>{priceRateDetailList.citySuperHighLayerFloorDiffAvg}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>{this.renderForm()}</div>
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
)(PriceRateDetail)
