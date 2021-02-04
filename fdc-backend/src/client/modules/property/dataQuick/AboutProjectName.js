/* eslint-disable */
import React, { Component,useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Form, Row, Col, Input, Switch, Icon, InputNumber, Table, Button, Popconfirm } from 'antd'
//const EditableContext = React.createContext();
import Immutable from 'immutable'

import { containerActions } from './actions'
import './sagas'
import './reducer'
import { modelSelector } from './selector'

import styles from './BaseInfo.less'

const FormItem = Form.Item
const originData = []

for (let i = 0; i < 100; i++) {
	originData.push({
		key: i.toString(),
		name: `Edrward ${i}`,
		age: 32,
		address: `London Park no. ${i}`,
	})
}

const EditableCell = ({
	  editing,
	  dataIndex,
	  title,
	  inputType,
	  record,
	  index,
	  children,
	  ...restProps
	  }) => {
	const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
	return (
		<td {...restProps}>
			{editing ? (
				<Form.Item
					name={dataIndex}
					style={{
						margin: 0,
					}}
					rules={[
						{
							required: true,
							message: `Please Input ${title}!`,
						},
					]}
				>
					{inputNode}
				</Form.Item>
			) : (
				children
			)}
		</td>
	);
};

/*
 * 楼盘新增 楼盘地址
 */
class AboutProjectName extends Component {
	static propTypes = {
		form: PropTypes.object.isRequired,
		model: PropTypes.instanceOf(Immutable.Map).isRequired,
	}
	
	constructor(props) {
		super(props)
		this.state = {
			markerList : [],
			searchValue:''
		}
		//props.onAddSecondRef(this)
	}
	
	componentDidMount() {
		//this.props.onRef(this)
	}
	
	
	EditableTable(){
		const [form] = Form.useForm();
		const [data, setData] = useState(originData);
		const [editingKey, setEditingKey] = useState('');
		
		const isEditing = (record) => record.key === editingKey;
		
		const edit = (record) => {
			form.setFieldsValue({
				name: '',
				age: '',
				address: '',
				...record,
			});
			setEditingKey(record.key);
		};
		
		const cancel = () => {
			setEditingKey('');
		};
		
		const save = async (key) => {
			try {
				const row = await form.validateFields();
				const newData = [...data];
				const index = newData.findIndex((item) => key === item.key);
				
				if (index > -1) {
					const item = newData[index];
					newData.splice(index, 1, { ...item, ...row });
					setData(newData);
					setEditingKey('');
				} else {
					newData.push(row);
					setData(newData);
					setEditingKey('');
				}
			} catch (errInfo) {
				console.log('Validate Failed:', errInfo);
			}
		};
		
		const columns = [
			{
				title: 'name',
				dataIndex: 'name',
				width: '25%',
				editable: true,
			},
			{
				title: 'age',
				dataIndex: 'age',
				width: '15%',
				editable: true,
			},
			{
				title: 'address',
				dataIndex: 'address',
				width: '40%',
				editable: true,
			},
			{
				title: 'operation',
				dataIndex: 'operation',
				render: (_, record) => {
					const editable = isEditing(record);
					return editable ? (
						<span>
			<a
				href="javascript:;"
				onClick={() => save(record.key)}
				style={{
					marginRight: 8,
				}}
			>
			  Save
			</a>
			<Popconfirm title="Sure to cancel?" onConfirm={cancel}>
			  <a>Cancel</a>
			</Popconfirm>
		  </span>
					) : (
						<a disabled={editingKey !== ''} onClick={() => edit(record)}>
							Edit
						</a>
					);
				},
			},
		];
		const mergedColumns = columns.map((col) => {
			if (!col.editable) {
				return col;
			}
			
			return {
				...col,
				onCell: (record) => ({
					record,
					inputType: col.dataIndex === 'age' ? 'number' : 'text',
					dataIndex: col.dataIndex,
					title: col.title,
					editing: isEditing(record),
				}),
			};
		});
		return (
			<Form form={form} component={false}>
				<Table
					components={{
						body: {
							cell: EditableCell,
						},
					}}
					bordered
					dataSource={data}
					columns={mergedColumns}
					rowClassName="editable-row"
					pagination={{
						onChange: cancel,
					}}
				/>
			</Form>
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
