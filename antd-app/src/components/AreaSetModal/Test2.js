import React, { Component } from 'react'
import { Form, Input, Button, Row, Col } from 'antd'
import { compose } from 'redux'
class Test2 extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initData: this.props.defaultData,
        }
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        // console.log(this.props)
        if (nextProps.defaultData !== this.props.defaultData) {
        }
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log(nextProps)
        // console.log(nextState)
        if (
            nextProps.defaultData.length !== nextState.initData.length &&
            nextProps.defaultData !== nextState.initData
        ) {
        }
    }

    collectManager = (param) => {
        const { getFieldValue, resetFields } = this.props.form
        const managerList = []
        const { initData } = this.state
        initData.forEach((item) => {
            if (param && param === item.id) {
                return true
            }

            let areaDown = getFieldValue(`areaDown${item.id}`)
            let areaUp = getFieldValue(`areaUp${item.id}`)
            // console.log('collectManager@areaDown', areaDown)
            // console.log('collectManager@areaUp', areaUp)
            // debugger
            console.log(+areaDown)
            console.log(+areaUp)
            // if (+areaUp> +areaDown) {
				// resetFields()
            // }
            resetFields([`areaDown${item.id}`, `areaUp${item.id}`])
			// resetFields()
            managerList.push({
                areaDown,
                areaUp,
                id: item.id
                    ? item.id
                    : `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000)}`,
            })
        })

        return managerList
    }

    addManager = (el) => {
        let managerList = this.collectManager()
        console.log(managerList)
        console.log('添加的那一项el', el)

        let thisIndex = managerList.findIndex((item) => {
            return item.id === el.id
        })
        let recom = {
            areaDown: el.areaUp,
            areaUp: '',
            id: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000)}`,
        }
        managerList.splice(thisIndex + 1, 0, recom)
        console.log(managerList)

        this.setState({ initData: managerList })
    }

    delManager = (el) => {
        console.log('删除的那一项el', el)
        let managerList = this.collectManager()
        let thisIndex = managerList.findIndex((item) => {
            return item.id === el.id
        })

        //删除指定index的元素
        managerList.splice(thisIndex, 1)
        console.log(managerList)

        this.setState({ initData: managerList })
    }
    handleChange = (el) => {
        console.log('handleChange@el', el)

        // const {getFieldValue, resetFields} = this.props.form;
        // const _a = `areaDown${el.id}`
        // const _b = `areaUp${el.id}`
        console.log(this.props)
        // setTimeout(() => {
        //     this.props.form.validateFields((err, values) => {
        //         if (err) {
        //             return;
        //         } else {
        //             console.log(values)
        //             let areaDown = values[_a]
        //             let areaUp = values[_b]
        //             let Obj ={areaDown, areaUp ,id: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000)}`}
        //             let {initData} = this.state;
        //             let thisIndex = initData.findIndex((item) => {
        //                 return item.id === el.id;
        //             });
        //             let ArrNew = initData
        //             ArrNew[thisIndex] = Obj
        //             // this.$nextTick(() => {
        //             //     this.props.form.setFieldsValue({
        //             //         initData:ArrNew
        //             //     })
        //             // })
        //         }
        //     });
        // }, 0);
    }

    handleSubmit = (e) => {
        if (e) e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // const {keys, names} = values;
                console.log('Received values of form: ', values)
                let { initData } = this.state
                initData.forEach((item) => {
                    item.areaDown = values[`areaDown${item.id}`]
                    item.areaUp = values[`areaUp${item.id}`]
                })
                // console.log(initData);
                this.setState({
                    initData,
                })
            }
        })
    }

    changeAsync = async (el) => {
        console.log('changeAsync@el', el)
    }

    _defineCallBack = () => {
        const values = this.props.form.getFieldsValue()
        console.log(values)
        let { initData } = this.state
        console.log('_defineCallBack@initData', initData)
        initData.forEach((item) => {
            item.areaDown = values[`areaDown${item.id}`]
            item.areaUp = values[`areaUp${item.id}`]
        })
        this.setState({
            initData,
        })
    }

    areaUpOnBlur = (el) => {
        console.log(el)
        let { initData } = this.state

        initData.forEach((item, index) => {
            if (item.id === el.id) {
                if (index < initData.length - 1) {
                    initData[index + 1]['areaDown'] = item.areaUp
                } else {
                    initData.push({
                        areaDown: item.areaUp,
                        areaUp: '',
                        id: `${Date.now()}-${Math.floor(
                            Math.random(0, 1) * 10000
                        )}`,
                    })
                }
            }
        })
        console.log(initData)
        this.setState(
            {
                initData,
            },
            () => {
                this.collectManager(el.id)
            }
        )
    }
    areaDownOnBlur = (el) => {
        console.log(el)
        let { initData } = this.state

        initData.forEach((item, index) => {
            if (item.id === el.id) {
                initData[index - 1].areaUp = item.areaDown
            }
        })
        console.log(initData)

        this.setState(
            {
                initData,
            },
            () => {
                this.collectManager(el.id)
            }
        )
    }

    handleValidateAreaDown = (rule, value, callback) => {
        let name = rule.field
        name = name.replace('areaDown', 'areaUp')

        let areaUp = this.props.form.getFieldValue(name)
        if (Number(value) >= Number(areaUp)) {
            callback('面积段最小值不能大于等于最大值')
        } else {
            callback()
        }
    }

    handleValidateAreaUp = (rule, value, callback) => {
        // console.log('handleValidateAreaUp@rule', rule)
        // console.log('handleValidateAreaUp@value', value)

        let name = rule.field
        name = name.replace('areaUp', 'areaDown')
        // console.log('name', name)

        let areaDown = this.props.form.getFieldValue(name)
        // console.log('areaDown', areaDown)

        if (Number(value) <= Number(areaDown)) {
            callback('面积段最大值不能小于等于最小值')
        } else {
            callback()
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form
        let { initData } = this.state
        console.log('render@initData', initData)
        let managerComps = initData.map((el, index) => (
            <Row span={24} key={el.id}>
                <Col span={8}>
                    <Form.Item
                        label="areaDown："
                        labelCol={{ span: 10 }}
                        wrapperCol={{ span: 12 }}>
                        {getFieldDecorator(`areaDown${el.id}`, {
                            initialValue: el.areaDown,
                            validateTrigger: ['onBlur'],
                            rules: [
                                { whitespace: true, required: true },
                                { validator: this.handleValidateAreaDown },
                            ],
                        })(
                            <Input
                                onChange={() =>
                                    this.changeAsync(el).then(
                                        this._defineCallBack
                                    )
                                }
                                onBlur={() => this.areaDownOnBlur(el)}
                                disabled={index === 0 && +el.areaDown === 0}
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="areaUp："
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 12 }}>
                        {getFieldDecorator(`areaUp${el.id}`, {
                            initialValue: el.areaUp,
                            validateTrigger: ['onBlur'],
                            rules: [
                                { whitespace: true, required: false },
                                { validator: index === initData.length ? this.handleValidateAreaUp:null },
                            ],
                        })(
                            <Input
                                onChange={() =>
                                    this.changeAsync(el).then(
                                        this._defineCallBack
                                    )
                                }
                                onBlur={() => this.areaUpOnBlur(el)}
                                min={el.areaDown + 1}
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={4} style={{ marginTop: 6 }}>
                    {el.areaDown || el.areaUp ? (
						el.areaUp !== Infinity?
                        <Button
                            shape="circle"
                            size="small"
                            icon="plus"
                            type="primary"
                            style={{ marginRight: 10 }}
                            onClick={() => this.addManager(el)}
                        />:null
                    ) : null}
                    {((initData > 1 && index === 0) || index > 0) && (
                        <Button
                            shape="circle"
                            size="small"
                            icon="minus"
                            type="default"
                            onClick={() => this.delManager(el)}
                        />
                    )}
                </Col>
            </Row>
        ))

        return (
            <Form onSubmit={this.handleSubmit}>
                <div>{managerComps}</div>
            </Form>
        )
    }
}
export default compose(Form.create())(Test2)
