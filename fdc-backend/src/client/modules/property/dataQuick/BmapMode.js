import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Form, Row, Col, Input, Switch, Icon, InputNumber } from 'antd'
import Immutable from 'immutable'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './BaseInfo.less'

const FormItem = Form.Item

const formItemLayout = {
	labelCol: {
		xs: { span: 6 },
		sm: { span: 10 }
	},
	wrapperCol: {
		xs: { span: 6 },
		sm: { span: 14 }
	}
}

/*
 * 楼盘新增 楼盘地址
 */
class BmapMode extends Component {
	static propTypes = {
		form: PropTypes.object.isRequired,
		model: PropTypes.instanceOf(Immutable.Map).isRequired,
	}
	
	constructor(props) {
		super(props)
		
		this.state = {
			defPoint: {},
			markerList : [],
			searchValue:'',
			// cityId : this.props.aboutAreaIds[1]
		}
		//props.onAddSecondRef(this)
	}
	
	componentWillMount() {
		this.props.onRef(this)
	}
	
	componentDidMount() {
		this.initBMap()
	}
	
	//
	setPointAdress = val =>{
		let self = this
		var	basePoint = new self.BMap.Point(val.longitude,val.latitude)
		var circle = new self.BMap.Circle(basePoint, 20,{
			StrokeStyle: "dashed",
			strokeOpacity: 1, // 轮廓
			fillColor: "#ff6600",
			fillOpacity: 0.1, // 填充
			strokeColor: '#ff6600',
			strokeWeight: 2,
		})
		self.map.centerAndZoom(basePoint,15)
	//	self.map.addOverlay(circle)
		//
		console.log("重新设置了地图...",val.longitude,val.latitude)
	}
	
	// restMap = () =>{
	// 	let self = this
	// 	const {defPoint} = this.state
	// 	var basePoint = new self.BMap.Point(defPoint.longitude, defPoint.latitude)
	// 	self.map.centerAndZoom(basePoint)
	// }
	
	// 初始化地图
	initBMap = val => {
		this.cityName = "深圳市"
		const BMap = window.BMap
		const map = new BMap.Map('map')
		this.BMap = BMap
		this.map = map
		map.disableDoubleClickZoom()
		if (!this.props.projectId) {
			map.centerAndZoom(this.cityName,15)
		}
		const that = this
		// 添加带有定位的导航控件
		const navigationControl = new BMap.NavigationControl({
			// 靠左上角位置
			anchor: 'BMAP_ANCHOR_TOP_LEFT',
			// LARGE类型
			type: 'BMAP_NAVIGATION_CONTROL_LARGE',
			// 启用显示定位
			enableGeolocation: false
		})
		map.addControl(navigationControl)
		
		// 添加定位控件
		const geolocationControl = new BMap.GeolocationControl()
		map.addControl(geolocationControl)
		
		// 添加地图类型控件
		/* eslint-disable */
		const mapTypeControl = new BMap.MapTypeControl({
			mapTypes: [
				BMAP_NORMAL_MAP,
				BMAP_PERSPECTIVE_MAP,
				BMAP_SATELLITE_MAP,
				BMAP_HYBRID_MAP
			]
		})
		map.addControl(mapTypeControl)
		
		// 开启鼠标滚轮缩放
		map.enableScrollWheelZoom(true)
		
		map.addEventListener('click', e => {
			// console.log(e)
			// 如是已删除的楼盘
			that.setState({
				searchStyle: false
			})
			const { lng, lat } = e.point
			// console.log(lng, lat)
			this.props.form.setFieldsValue({ longitude: lng })
			this.props.form.setFieldsValue({ latitude: lat })
			
			// 地图标点
			map.clearOverlays()
			const point = new BMap.Point(lng, lat)
			const marker = new BMap.Marker(point)
			map.addOverlay(marker)
		})
		
		//const projectDetail = this.props.projectDetail
		//this.markMap(projectDetail)
		// S 搜索
		// 百度地图API功能
		function G(id) {
			return document.getElementById(id)
		}
		
		function setPlace() {
			map.clearOverlays() // 清除地图上所有覆盖物
			var countNum = 0
			var local = new BMap.LocalSearch(map, {
				// 智能搜索
				onSearchComplete: myFun
			})
			function myFun(results) {
				var pp = local.getResults().getPoi(0).point // 获取第一个智能搜索的结果
				// var pp = local.getResults()
				map.centerAndZoom(pp, 18)
				
				// map.addOverlay(new BMap.Marker(pp)) // 添加标注
				
				// S 地图标注title显示
				var projectData = local.getResults().Qq
				// console.log(projectData)
				for (var i = 0; i < results.getCurrentNumPois(); i ++){
					// s.push(results.getPoi(i).title + ", " + results.getPoi(i).address);
					var basePoint = new BMap.Point(
						results.getPoi(i).point.lng,
						results.getPoi(i).point.lat
					)
					var myIcon = new BMap.Icon(
						'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
						new BMap.Size(21, 33),
						{
							offset: new BMap.Size(countNum, 21), // 指定定位位置
							imageOffset: new BMap.Size((0 - countNum) * 21, 0) // 设置图片偏移
						}
					)
					
					var marker = new BMap.Marker(basePoint, { icon: myIcon })
					map.addOverlay(marker)
					// 信息窗口
					// console.log(projectData[i].title)
					openInfoWindow(
						marker,
						basePoint,
						results.getPoi(i).title,
						results.getPoi(i).address
					)
					countNum++
				}
			}
			local.search(myValue)
		}
		
		// S 点击标注显示信息窗口
		var openInfoWindow = function(marker, point, title, address) {
			// 定义自定义覆盖物的构造函数
			function SquareOverlay(point, text) {
				this._point = point
				this._text = text
			}
			// 继承API的BMap.Overlay
			SquareOverlay.prototype = new BMap.Overlay()
			
			// 实现初始化方法
			SquareOverlay.prototype.initialize = function(map) {
				// 保存map对象实例
				this._map = map
				// 创建div元素，作为自定义覆盖物的容器
				var div = document.createElement('div')
				div.style.position = 'absolute'
				// 可以根据参数设置元素外观
				div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat)
				div.style.backgroundColor = '#EE5D5B'
				div.style.border = '1px solid #EE5D5B'
				div.style.color = 'white'
				div.style.padding = '3px 8px'
				div.style.whiteSpace = 'nowrap'
				div.style.MozUserSelect = 'none'
				div.style.fontSize = '14px'
				var span = (this._span = document.createElement('span'))
				div.appendChild(span)
				span.appendChild(document.createTextNode(this._text))
				// 将div添加到覆盖物容器中
				var arrow = (this._arrow = document.createElement('div'))
				arrow.style.background =
					'url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat'
				arrow.style.position = 'absolute'
				arrow.style.width = '11px'
				arrow.style.height = '10px'
				arrow.style.top = '27px'
				arrow.style.left = '10px'
				arrow.style.overflow = 'hidden'
				div.appendChild(arrow)
				map.getPanes().labelPane.appendChild(div)
				// 保存div实例
				this._div = div
				// 需要将div元素作为方法的返回值，当调用该覆盖物的show、
				// hide方法，或者对覆盖物进行移除时，API都将操作此元素。
				return div
			}
			// 实现绘制方法
			SquareOverlay.prototype.draw = function() {
				// 根据地理坐标转换为像素坐标，并设置给容器
				var position = this._map.pointToOverlayPixel(this._point)
				this._div.style.left =
					position.x - parseInt(this._arrow.style.left) + 'px'
				this._div.style.top = position.y - 56 + 'px'
			}
			var mySquare = new SquareOverlay(point, title)
			marker.addEventListener('mouseover', function() {
				// 添加自定义覆盖物
				map.addOverlay(mySquare)
			})
			marker.addEventListener('mouseout', function() {
				// 删除自定义覆盖物
				map.removeOverlay(mySquare)
			})
		}
		// E 点击标注显示信息窗口
		
		// E 搜索
	}
	
	markMap = projectDetail => {
		const BMap = window.BMap
		const { longitude, latitude } = projectDetail
		console.log(projectDetail)
		this.map.clearOverlays()
		if (longitude && latitude) {
			const point = new BMap.Point(longitude, latitude)
			const marker = new BMap.Marker(point)
			this.map.addOverlay(marker)
			this.map.centerAndZoom(point, 15)
		} else {
			this.map.centerAndZoom(this.cityName, 15)
		}
	}
	
	//地图搜索回车事件
	mapSearchEnter = (e,type) =>{
		const code = e.keyCode
		if(code===13||type){
			let countNum = 0
			let that = this
			var options = {
				onSearchComplete: function (results) {
					that.setState({
						searchStyle: true
					})
					that.map.clearOverlays()
					// 判断状态是否正确
					if (local.getStatus() === BMAP_STATUS_SUCCESS) {
						let list = []
						for (var i = 0; i < results.getCurrentNumPois(); i++) {
							if(i===0&&(type!==2||code===13)){
								that.map.centerAndZoom(results.getPoi(i).point, 15)
							}
							var basePoint = new BMap.Point(
								results.getPoi(i).point.lng,
								results.getPoi(i).point.lat
							)
							var myIcon = new BMap.Icon(
								'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
								new BMap.Size(21, 33),
								{
									offset: new BMap.Size(countNum, 21), // 指定定位位置
									imageOffset: new BMap.Size((0 - countNum) * 21, 0) // 设置图片偏移
									// imageOffset: new BMap.Size((0 - countNum) * 21, -61) // 设置图片偏移
								}
							)
							var marker = new BMap.Marker(basePoint, { icon: myIcon })
							if(type!==2||code===13){
								that.map.addOverlay(marker)
							}
							// S 点击标注显示信息窗口
							var openInfoWindow = function(marker, point, title, address) {
								// 定义自定义覆盖物的构造函数
								function SquareOverlay(point, text) {
									this._point = point
									this._text = text
								}
								// 继承API的BMap.Overlay
								SquareOverlay.prototype = new BMap.Overlay()
								
								// 实现初始化方法
								SquareOverlay.prototype.initialize = function(map) {
									// 保存map对象实例
									this._map = map
									// 创建div元素，作为自定义覆盖物的容器
									var div = document.createElement('div')
									div.style.position = 'absolute'
									// 可以根据参数设置元素外观
									div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat)
									div.style.backgroundColor = '#EE5D5B'
									div.style.border = '1px solid #EE5D5B'
									div.style.color = 'white'
									div.style.padding = '3px 8px'
									div.style.whiteSpace = 'nowrap'
									div.style.MozUserSelect = 'none'
									div.style.fontSize = '14px'
									var span = (this._span = document.createElement('span'))
									div.appendChild(span)
									span.appendChild(document.createTextNode(this._text))
									// 将div添加到覆盖物容器中
									var arrow = (this._arrow = document.createElement('div'))
									arrow.style.background =
										'url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat'
									arrow.style.position = 'absolute'
									arrow.style.width = '11px'
									arrow.style.height = '10px'
									arrow.style.top = '27px'
									arrow.style.left = '10px'
									arrow.style.overflow = 'hidden'
									div.appendChild(arrow)
									map.getPanes().labelPane.appendChild(div)
									// 保存div实例
									this._div = div
									// 需要将div元素作为方法的返回值，当调用该覆盖物的show、
									// hide方法，或者对覆盖物进行移除时，API都将操作此元素。
									return div
								}
								// 实现绘制方法
								SquareOverlay.prototype.draw = function() {
									// 根据地理坐标转换为像素坐标，并设置给容器
									var position = this._map.pointToOverlayPixel(this._point)
									this._div.style.left =
										position.x - parseInt(this._arrow.style.left) + 'px'
									this._div.style.top = position.y - 56 + 'px'
								}
								var mySquare = new SquareOverlay(point, title)
								marker.addEventListener('mouseover', function() {
									// 添加自定义覆盖物
									that.map.addOverlay(mySquare)
								})
								marker.addEventListener('mouseout', function() {
									// 删除自定义覆盖物
									that.map.removeOverlay(mySquare)
								})
							}
							openInfoWindow(
								marker,
								basePoint,
								results.getPoi(i).title,
								results.getPoi(i).address
							)
							countNum++
							marker.getPoi = results.getPoi(i)
							console.log(marker.getPoi)
							list.push(marker)
							// s.push(results.getPoi(i).title + ", " + results.getPoi(i).address);
						}
						that.setState({
							markerList:list
						})
					}
				}
			}
			let local = new BMap.LocalSearch(this.map, options)
			local.search(document.getElementById('suggestId').value);
		}
	}
	
	searchMouseover = (index) =>{
		let marker = this.state.markerList[index]
		let icon = new BMap.Icon(
			'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
			new BMap.Size(21, 33),
			{
				offset: new BMap.Size(index, 21), // 指定定位位置
				imageOffset: new BMap.Size((0 - index) * 21, -66) // 设置图片偏移
			}
		)
		marker.setIcon(icon)
	}
	
	searchMouseOut = (index) =>{
		let marker = this.state.markerList[index]
		var myIcon = new BMap.Icon(
			'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
			new BMap.Size(21, 33),
			{
				offset: new BMap.Size(index, 21), // 指定定位位置
				imageOffset: new BMap.Size((0 - index) * 21, 0) // 设置图片偏移
				// imageOffset: new BMap.Size((0 - countNum) * 21, -61) // 设置图片偏移
			}
		)
		marker.setIcon(myIcon)
	}
	
	searchClick = (index) =>{
		let marker = this.state.markerList[index]
		const that = this
		this.map.clearOverlays()
		// this.map.panTo(new BMap.Point(marker.point.lng,marker.point.lat))
		this.map.centerAndZoom(new BMap.Point(marker.point.lng,marker.point.lat),19)
		var basePoint = new BMap.Point(
			marker.point.lng,
			marker.point.lat
		)
		var myIcon = new BMap.Icon(
			'https://webmap0.bdimg.com/wolfman/static/common/images/markers_new2_7621a9c.png',
			new BMap.Size(21, 33),
			{
				offset: new BMap.Size(0, 21), // 指定定位位置
				imageOffset: new BMap.Size((0 - 0) * 21, 0) // 设置图片偏移
				// imageOffset: new BMap.Size((0 - countNum) * 21, -61) // 设置图片偏移
			}
		)
		let newMarker = new BMap.Marker(basePoint, { icon: myIcon })
		this.map.addOverlay(newMarker)
		var openInfoWindow = function(marker, point, title, address) {
			// 定义自定义覆盖物的构造函数
			function SquareOverlay(point, text) {
				this._point = point
				this._text = text
			}
			// 继承API的BMap.Overlay
			SquareOverlay.prototype = new BMap.Overlay()
			
			// 实现初始化方法
			SquareOverlay.prototype.initialize = function(map) {
				// 保存map对象实例
				this._map = map
				// 创建div元素，作为自定义覆盖物的容器
				var div = document.createElement('div')
				div.style.position = 'absolute'
				// 可以根据参数设置元素外观
				div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat)
				div.style.backgroundColor = '#EE5D5B'
				div.style.border = '1px solid #EE5D5B'
				div.style.color = 'white'
				div.style.padding = '3px 8px'
				div.style.whiteSpace = 'nowrap'
				div.style.MozUserSelect = 'none'
				div.style.fontSize = '14px'
				var span = (this._span = document.createElement('span'))
				div.appendChild(span)
				span.appendChild(document.createTextNode(this._text))
				// 将div添加到覆盖物容器中
				var arrow = (this._arrow = document.createElement('div'))
				arrow.style.background =
					'url(http://map.baidu.com/fwmap/upload/r/map/fwmap/static/house/images/label.png) no-repeat'
				arrow.style.position = 'absolute'
				arrow.style.width = '11px'
				arrow.style.height = '10px'
				arrow.style.top = '27px'
				arrow.style.left = '10px'
				arrow.style.overflow = 'hidden'
				div.appendChild(arrow)
				map.getPanes().labelPane.appendChild(div)
				// 保存div实例
				this._div = div
				// 需要将div元素作为方法的返回值，当调用该覆盖物的show、
				// hide方法，或者对覆盖物进行移除时，API都将操作此元素。
				return div
			}
			// 实现绘制方法
			SquareOverlay.prototype.draw = function() {
				// 根据地理坐标转换为像素坐标，并设置给容器
				var position = this._map.pointToOverlayPixel(this._point)
				this._div.style.left =
					position.x - parseInt(this._arrow.style.left) + 'px'
				this._div.style.top = position.y - 56 + 'px'
			}
			var mySquare = new SquareOverlay(point, title)
			marker.addEventListener('mouseover', function() {
				// 添加自定义覆盖物
				that.map.addOverlay(mySquare)
			})
			marker.addEventListener('mouseout', function() {
				// 删除自定义覆盖物
				that.map.removeOverlay(mySquare)
			})
		}
		openInfoWindow(
			newMarker,
			basePoint,
			marker.getPoi.title,
			marker.getPoi.address
		)
		// this.map.setZoom(18)
		this.setState({
			searchStyle: false,
			searchValue:marker.getPoi.province+marker.getPoi.city+marker.getPoi.title
		})
	}
	
	change(e){
		this.setState({
			searchValue:e.target.value
		})
	}
	
	
	
	mapSearchPanel = () =>{
		setPlace()
	}
	
	handleValidateLongtitude = (rule, value, callback) => {
		if (value !== undefined && value !== null && value <= 0) {
			callback('经度应大于0')
		}
		callback()
	}
	
	handleValidateLatitude = (rule, value, callback) => {
		if (value !== undefined && value !== null && value <= 0) {
			callback('纬度应大于0')
		}
		callback()
	}
	
	handleLngLatBlur = () => {
		const { longitude, latitude } = this.props.form.getFieldsValue([
			'longitude',
			'latitude'
		])
		if (longitude > 0 && latitude > 0) {
			const data = {
				longitude,
				latitude
			}
			this.markMap(data)
		}
	}
	
	stripNum = (num) => {
		if (num !== null && num !== undefined) {
			return +parseFloat(num)
		}
	}
	
	render() {
		const {
			form: { getFieldDecorator },
			cityId
		} = this.props
		
		return (
			<form>
				<Row>
					<Col span={8}>
						<FormItem label="经度" {...formItemLayout}>
							{getFieldDecorator('longitude', {
								rules: [
									{
										validator: this.handleValidateLongtitude
									}
								]
							})(
								<InputNumber
									style={{ width: '100%' }}
									// precision={14}
									placeholder="请输入经度"
									// min={0}
									onBlur={this.handleLngLatBlur}
								/>
							)}
						</FormItem>
					</Col>
					<Col span={8}>
						<FormItem label="纬度" {...formItemLayout}>
							{getFieldDecorator('latitude', {
								rules: [
									{
										validator: this.handleValidateLatitude
									}
								]
							})(
								<InputNumber
									style={{ width: '100%' }}
									// precision={14}
									placeholder="请输入纬度"
									// min={0}
									onBlur={this.handleLngLatBlur}
								/>
							)}
						</FormItem>
					</Col>
				</Row>
				<Row>
					<div style={{position:'relative'}}>
						<div>
							<div id="r-result" className={styles.searchMap}>
								<input type="text" id="suggestId" className={styles.searchInput} onKeyUp={e=>this.mapSearchEnter(e,2)} autoComplete="off" value={this.state.searchValue} onChange={(event)=>{this.change(event)}}/>
								<Icon type="search" className={styles.searchIcon}  onClick={e=>this.mapSearchEnter(e,1)}/>
								{/* <div className={styles.blockS} onClick={this.searchBlock}>
              <Icon type="search" />
            </div> */}
							</div>
							<div
								id="map"
								style={{ width: '100%', height: '500px', marginBottom: 24 }}
							/>
						</div>
						{/*<div id="searchResultPanel" className={styles.searchDownLi} />*/}
						<div className={styles.mySearchList}  style={{display:this.state.searchStyle?'block':'none'}}>
							<ul>
								{this.state.markerList.map((item,index) => (
									<li key={item.getPoi.uid} onMouseOver={()=>this.searchMouseover(index)} onMouseOut={()=>this.searchMouseOut(index)} onClick={()=>this.searchClick(index)}>
										<Icon type="search" style={{marginRight:10}}/>{item.getPoi.title}
									</li>
								))}
							</ul>
						</div>
					</div>
				</Row>
			</form>
		)
	}
}

export default compose(
	Form.create(),
	connect(
		modelSelector,
		containerActions
	)
)(BmapMode)
