/* eslint-disable */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {Form, Modal, Row, Col, Input, Message, Icon, Table, Button, Popconfirm, Select,Tooltip} from 'antd'
import Immutable from 'immutable'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './BaseInfo.less'
import moment from "moment"

const FormItem = Form.Item
//let originData = []

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
// 		projectName: `Edrward ${i}`,
// 		region: 32,
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
		isMatchBatchProject: PropTypes.func.isRequired,
		verifyProjectName: PropTypes.func.isRequired,
	}
	
	constructor(props) {
		super(props)
		this.state = {
			addModal: false,
			originData: [],
			projectName: '',
			addType: true,
			EditKey: '',
			cityId: '',
			projectId: '',
			isName : false
		}
		//props.onAddSecondRef(this)
	}
	
	componentDidMount() {
		this.props.onRef(this);
	}
	
	componentWillReceiveProps(nextProps) {
		if(nextProps.aboutName){
			let originData =  nextProps.aboutName
			originData.map(item=>{
				item.key = item.id || item.key
			})
			this.setState({originData})
		}
		if (nextProps.projectName) {
			this.setState(nextProps.projectName)
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
	
	/*删除相关楼盘名称*/
	projectDelete  = key => {
		const originData = this.state.originData
		let delObj = null
		originData.map(item =>{
			if(key == item.key){
				item.delBtn = true;
				item.operationType = 3
				delObj = item
				if(delObj.typeCode == '9019002' || delObj.typeCode == '9019003'){
					let parm = {
						areaName: delObj.areaName,
						cityId: this.state.cityId,
						projectAlias: delObj.alias,
						typeCode: delObj.typeCode,
						projectId: this.state.projectId
					}
					this.props.verifyProjectName(parm,res=>{
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
			}
		})
		this.setState({
			originData:originData
		})
		console.log(this.state.originData)
		//this.props.getProjectNameCom(originData)
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
		//this.props.getProjectNameCom(originData)
	}
	
	addAboutAreaNameNameOnBlur = (rule, value, callback) =>{
		let vm = this;
		const cityId = vm.state.cityId
		if(vm.props.form.getFieldsValue(['alias']).alias){
			let parm = {
				areaName: value,
				cityId: cityId,
				projectAlias:vm.props.form.getFieldsValue(['alias']).alias
			}
			vm.props.isMatchBatchProject(parm, res =>{
				if(res){
					callback('当前行政区下相关楼盘名称不能与正式楼盘重名')
				}
			})
		}
		
		callback()
	}
	
	// 相关楼盘名称失去焦点
	addAboutProjectNameOnBlur = (rule, value, callback) =>{
		let vm = this;
		let reg =  /^[^\s]*$/
		const projectName = vm.state.projectName
		// const cityId = vm.state.cityId
		let listTrue = false
		const originData = vm.state.originData || [];
		if(vm.state.addType){
			originData.map(item =>{
				if(item.alias == value){
					listTrue = true
				}
			})
		}else{
			const EditKey = vm.state.EditKey
			originData.map(item =>{
				if(item.alias == value){
					if(item.key == EditKey){
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
		
		if (listTrue  || value == projectName) {
			if(listTrue){
				callback('相关楼盘名称不能与现有相关楼盘名称重名')
			}
			if(value == projectName){
				callback('相关楼盘名称不能与当前楼盘名称重名')
			}
		}
		else{
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
		this.props.form.setFieldsValue({ alias: val.alias,areaName:val.areaName,typeCode:val.typeCode.toString()})
	}
	
	/*新增相关楼盘名称点击事件*/
	addProjectName = () =>{
		this.addNameClearForm()
		this.setState({
			addModal:true,
			addType:true
		})
	}
	
	addNameClearForm = () =>{
		this.props.form.setFieldsValue({ alias: '',areaName:'',typeCode: ''})
	}
	
	/*确认新增相关楼盘名称*/
	enterAddName = e =>{
		if (e) {
			e.preventDefault()
		}
		let self = this
		self.props.form.validateFields((err, values) => {
			if (!err) {
				let originData = self.state.originData || []
				const cityId = self.state.cityId
				const {alias,areaName,typeCode} = this.props.form.getFieldsValue([
					'alias',
					'areaName',
					'typeCode'
				])
				let parm = {
					areaName: areaName,
					cityId: cityId,
					projectAlias:alias
				}
				self.props.isMatchBatchProject(parm, res =>{
					if(res.data && res.data.length>0){
						Message.error('相关楼盘名称不能与正式楼盘重名')
					}else{
						if(self.state.addType){
							let num = originData.length ? originData.length : 0
							originData.push({
								key: num.toString(),
								alias: `${alias}`,
								areaName: areaName,
								typeCode: typeCode,
							})
							console.log(alias,areaName,typeCode,originData);
						}else {
							originData.map(item =>{
								if(item.key == self.state.EditKey){
									item.alias = alias;
									item.areaName = areaName;
									item.typeCode = typeCode;
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
		//this.props.getProjectNameCom(originData)
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
			aliaTypeList,
		} = this.props.model
		const columns = [
			{
				title: '楼盘名称',
				width: '30%',
				editable: true,
				render: (_, record) => (
					record.delBtn?
						<span className={styles.deleteProjectRow}>{record.alias}</span>
						:
						<span>{record.alias}</span>
				),
				dataIndex: 'alias',
			},
			{
				title: '行政区',
				dataIndex: 'areaName',
				width: '20%',
				editable: true,
				render: (_, record) => (
					record.delBtn?
						<span className={styles.deleteProjectRow}>{record.areaName}</span>
						:
						<span>{record.areaName}</span>
				)
				
			},
			{
				title: '类型',
				dataIndex: 'typeCode',
				width: '15%',
				editable: true,
				render: (_, record) => (
					record.delBtn?
						<span className={styles.deleteProjectRow}>
							{
								record.typeCode == '9019002' ? (<span>网络推广名</span>):null ||
								record.typeCode == '9019003' ? (<span>证载名称</span>):null ||
								record.typeCode == '9019005' ? (<span>案例匹配名</span>):null
							}
						</span>
						:
						<span>
							{
								record.typeCode == '9019002' ? (<span>网络推广名</span>):null ||
								record.typeCode == '9019003' ? (<span>证载名称</span>):null ||
								record.typeCode == '9019005' ? (<span>案例匹配名</span>):null
							}
						</span>
				)
			},
			{
				title: '操作',
				// width: '30%',
				// dataIndex: 'operation',
				render: (_, record) => (
					<div>
						<a disabled={record.delBtn} onClick={() => this.ProjectEdit(record)} className={styles.endBtn}>编辑</a>
						{
							record.delBtn ? (
							<a onClick={() => this.cancelProjectDelete(record.key)} className={styles.endBtn}>
								取消删除
								{record.isName ? (<Tooltip  placement="topLeft" title="该相关楼盘名称,在所关联的楼盘别名里,该别名也将被删掉"><Icon style={{color:'#FF5722',paddingLeft: "10px"}} type="info-circle" /></Tooltip>):null}
							</a>)
							:
							// (<Popconfirm title="此删除不作物理删除" onConfirm={()=>this.projectDelete(record.key)}>
							// </Popconfirm>)
							<a onClick={()=>this.projectDelete(record.key)} className={styles.endBtn}>
								删除
							</a>
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
					title={this.state.addType? '新增相关楼盘名称':'编辑相关楼盘名称'}
					visible={this.state.addModal}
					onOk={this.enterAddName}
					onCancel={this.handleCancel}
				>
					<Form>
						<Row>
							<Col span={8}>
								<FormItem {...formItemLayout} label="相关楼盘名称">
									{getFieldDecorator('alias', {
										rules: [
											{ required: true, message: '请输入楼盘名称' },
											{
												validator: this.addAboutProjectNameOnBlur
											},
											{
												max: 100,
												message: '最大长度100'
											},
											// {
											// 	pattern: /^[^\s]*$/,
											// 	message: '不能输入空格字符'
											// }
										],
									})(<Input placeholder="请输入相关楼盘名称" />)}
								</FormItem>
							</Col>
							<Col span={8}>
								<FormItem {...formItemLayout} label="行政区">
									{getFieldDecorator('areaName', {
										rules: [
											// { required: true, message: '请选择别名类型' },
											{
												max: 50,
												message: '最大长度50'
											},
											{
												pattern: /^[^\s]*$/,
												message: '不能输入空格字符'
											}
											// {
											// 	validator: this.addAboutAreaNameNameOnBlur
											// },
										],
									})(<Input placeholder="请输入行政区" />)}
								</FormItem>
							</Col>
							<Col span={8}>
								<FormItem {...formItemLayout} label="别名类型">
									{getFieldDecorator('typeCode', {
										rules: [{ required: true, message: '请选择别名类型' }],
									})(
										<Select style={{ width: '100%' }} placeholder="请选择">
											{aliaTypeList.map(option => (
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
