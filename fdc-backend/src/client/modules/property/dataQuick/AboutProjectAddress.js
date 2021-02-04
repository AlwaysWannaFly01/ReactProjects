/* eslint-disable */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {
	Form,
	Modal,
	Row,
	Col,
	Input,
	Switch,
	Icon,
	InputNumber,
	Table,
	Button,
	Popconfirm,
	Select,
	Message,
	Tooltip
} from 'antd'
import Immutable from 'immutable'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './BaseInfo.less'
import moment from "moment"

const FormItem = Form.Item
let originData = []

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
// for (let i = 0; i < 6; i++) {
// 	originData.push({
// 		key: i.toString(),
// 		projectAddress: `Edrward ${i}`,
// 		aliaType: `9019002`,
// 	})
// }

/*
 * 楼盘新增 楼盘地址
 */
class AboutProjectName extends Component {
	static propTypes = {
		form: PropTypes.object.isRequired,
		model: PropTypes.instanceOf(Immutable.Map).isRequired,
		addressValidate: PropTypes.func.isRequired,
		verifyProjectAddress: PropTypes.func.isRequired,
	}
	
	constructor(props) {
		super(props)
		this.state = {
			addModal: false,
			originData: [],
			addType: true,
			EditKey: '',
			cityId: ''
		}
		//props.onAddSecondRef(this)
	}
	
	componentDidMount() {
		this.props.onRef(this);
	}
	
	componentWillReceiveProps(nextProps) {
		if(nextProps.aboutAdress){
			let originData =  nextProps.aboutAdress
			originData.map(item=>{
				item.key = item.id || item.key
			})
			this.setState({originData})
		}
		if(nextProps.cityId){
			console.log("获取到父组件的省市区",nextProps.cityId)
			this.setState({cityId:nextProps.cityId.areaIds[1]})
		}
		if(nextProps.projectId){
			this.setState({projectId:nextProps.projectId})
		}
	}
	
	restComDataName = data =>{
		this.setState({originData:data})
		console.log("更新了子组件")
	}
	
 	addRessClearForm = () =>{
		 this.props.form.setFieldsValue({ propertyAddress: '',addressType:''})
	}
	
	/*删除相关楼盘名称*/
	projectDelete  = key => {
		const originData = this.state.originData
		let delObj = null
		originData.map(item =>{
			if(key == item.key){
				item.delBtn = true;
				item.operationType = 3
				delObj = item
				let parm = {
					cityId: this.state.cityId,
					projectAddress: delObj.propertyAddress,
					projectId: this.state.projectId
				}
				this.props.verifyProjectAddress(parm,res=>{
					if(res.code == 200){
						item.isName = res.data
						//this.setState({isName: res.data})
						this.setState({
							originData:originData
						})
						return true
					}else{
						Message.error(res.message)
						this.setState({
							originData:originData
						})
						return true
					}
				})
			}
		})
		this.setState({
			originData:originData
		})
		console.log(this.state.originData)
		//this.props.getProjectAddressCom(originData)
	}
	
	/*取消删除*/
	cancelProjectDelete = key => {
		const originData = this.state.originData
		originData.map(item =>{
			if(key == item.key){
				item.delBtn = false;
				delete item.operationType
			}
		})
		this.setState({
			originData:originData
		})
		console.log(this.state.originData)
		//this.props.getProjectAddressCom(originData)
	}
	
	// 相关楼盘地址失去焦点
	addAboutProjectNameOnBlur = (rule, value, callback) =>{
		let vm = this;
		let reg =  /^[^\s]*$/
		let listTrue = false
		let originData = vm.state.originData || [];
		if(vm.state.addType){
			originData.map(item =>{
				if(item.propertyAddress == value){
					listTrue = true
				}
			})
		}else{
			const EditKey = vm.state.EditKey
			console.log("删除之后",originData)
			originData.map(item =>{
				if(item.propertyAddress == value){
					if(item.key == EditKey){
						//originData.splice(index,1)
						listTrue = false
					}else{
						listTrue = true
					}
				}
			})
		}
		if(!reg.test(value)){
			callback('不能输入空格字符')
		}
		if (listTrue) {
			callback('相关楼盘地址与现有的相关楼盘地址重名')
		}else{
			callback()
		}
		callback()
	}
	
	/*编辑相关楼盘名称点击事件*/
	ProjectEdit  = val => {
		this.setState({
			addModal:true,
			addType:false,
			EditKey: val.key
		})
		this.props.form.setFieldsValue({ propertyAddress: val.propertyAddress,addressType:val.addressType.toString()})
	}
	
	/*新增相关楼盘名称点击事件*/
	addProjectName = () =>{
		this.addRessClearForm()
		this.setState({
			addModal:true,
			addType:true
		})
	}
	
	/*确认新增相关楼盘名称*/
	enterAddName = e =>{
		if (e) {
			e.preventDefault()
		}
		let self = this
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let originData = this.state.originData || []
				const cityId = this.state.cityId
				const {propertyAddress,addressType} = this.props.form.getFieldsValue([
					'propertyAddress',
					'addressType'
				])
				let parm = {
					cityId,
					projectAddress:propertyAddress
				}
				self.props.addressValidate(parm, res=>{
					if(res.data){
						Message.error('该城市已经有关联的相关楼盘地址')
					}else{
						if(self.state.addType){
							let num = originData.length ? originData.length : 0
							originData.push({
								key: num.toString(),
								propertyAddress: `${propertyAddress}`,
								addressType: addressType,
							})
							console.log(originData);
						}else {
							originData.map(item =>{
								if(item.key == self.state.EditKey){
									item.propertyAddress = propertyAddress;
									item.addressType = addressType;
								}
							})
						}
						
						self.setState({
							addModal:false,
							originData
						})
					}
				})
			}
		})
		//this.props.getProjectAddressCom(originData)
	}
	
	/*退出新增*/
	handleCancel =() =>{
		this.setState({
			addModal:false
		})
	}
	
	EditableTable(){
		const originData = this.state.originData
		const { getFieldDecorator } = this.props.form
		/* eslint-disable */
		const {
			addrTypeList,
		} = this.props.model
		const columns = [
			{
				title: '楼盘地址',
				width: '30%',
				editable: true,
				render: (_, record) => (
					record.delBtn?
						<span className={styles.deleteProjectRow}>{record.propertyAddress}</span>
						:
						<span>{record.propertyAddress}</span>
				),
				dataIndex: 'propertyAddress',
			},
			{
				title: '类型',
				dataIndex: 'aliaType',
				width: '30%',
				editable: true,
				render: (_, record) => (
					record.delBtn?
						<span className={styles.deleteProjectRow}>
							{
								record.addressType == '9020001' ? (<span>证载地址</span>):null ||
								record.addressType == '9020002' ? (<span>网络楼盘地址</span>):null
							}
						</span>
						:
						<span>
							{
								record.addressType == '9020001' ? (<span>证载地址</span>):null ||
								record.addressType == '9020002' ? (<span>网络楼盘地址</span>):null
							}
						</span>
				)
			},
			{
				title: '操作',
				// dataIndex: 'operation',
				render: (_, record) => (
					<div>
						<a disabled={record.delBtn} onClick={() => this.ProjectEdit(record)} className={styles.endBtn}>编辑</a>
						{
							record.delBtn ? (
							<a onClick={() => this.cancelProjectDelete(record.key)} className={styles.endBtn}>
								取消删除
								{record.isName ? (<Tooltip  placement="topLeft" title="该相关楼盘地址,在所关联的楼盘地址里,该地址也将被删掉"><Icon style={{color:'#FF5722',paddingLeft: "10px"}} type="info-circle" /></Tooltip>):null}
							</a>)
							:
							// (<Popconfirm title="此删除不作物理删除" onConfirm={()=>this.projectDelete(record.key)}>
							// </Popconfirm>)
							<a onClick={()=>this.projectDelete(record.key)} className={styles.endBtn} >删除</a>
						}
		  			</div>
				)
			},
		];
		
		return (
			<div>
				<Button type="primary" onClick={this.addProjectName} icon="plus" style={{ marginRight: 20,marginBottom:20 }}>
					新增
				</Button>
				<Table
					bordered
					dataSource={originData}
					columns={columns}
					rowClassName="editable-row"
					className={styles.defineTable}
					pagination="false"
				// pagination={{
					// 	onChange: this.cancel,
					// }}
				/>
				<Modal
					width="800px"
					title={this.state.addType? '新增相关楼盘地址':'编辑相关楼盘地址'}
					visible={this.state.addModal}
					onOk={this.enterAddName}
					onCancel={this.handleCancel}
				>
					<Form>
						<Row>
							<Col span={8}>
								<FormItem {...formItemLayout} label="相关楼盘地址">
									{getFieldDecorator('propertyAddress', {
										rules: [
											{ required: true, message: '请选择相关楼盘地址' },
											{
												max: 200,
												message: '最大长度200'
											},
											{
												validator: this.addAboutProjectNameOnBlur
											},
											// {
											// 	pattern: /^[^\s]*$/,
											// 	message: '不能输入空格字符'
											// }
										],
									})(<Input placeholder="请输入相关楼盘地址" />)}
								</FormItem>
							</Col>
							<Col span={8}>
								<FormItem {...formItemLayout} label="地址类型">
									{getFieldDecorator('addressType', {
										rules: [{ required: true, message: '请选择地址类型' }],
									})(
										<Select style={{ width: '100%' }} placeholder="请选择">
											{addrTypeList.map(option => (
												<Option key={option.get('code')} value={option.get('code')}>
													{option.get('name')}
												</Option>
											))}
										</Select>
									)}
								</FormItem>
							</Col>
						</Row>
					</Form>
				</Modal>
			</div>
		);
	};
	render() {
		return (
			<div>
				{this.EditableTable()}
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
)(AboutProjectName)
