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

    collectManager = (param) => {
        const { getFieldValue, resetFields } = this.props.form
        const managerList = []
        const { initData } = this.state
        if (param) {
            initData.forEach((item) => {
                if (param && param === item.id) {
                    return true
                }
                let areaDown = getFieldValue(`areaDown${item.id}`)
                let areaUp = getFieldValue(`areaUp${item.id}`)
                if (+areaDown >= +areaUp) {
                    return true
                }
                resetFields([`areaDown${item.id}`, `areaUp${item.id}`])
                managerList.push({
                    areaDown,
                    areaUp,
                    id: item.id
                        ? item.id
                        : `${Date.now()}-${Math.floor(
                              Math.random(0, 1) * 10000
                          )}`,
                })
            })
        } else {
            initData.forEach((item) => {
                let areaDown = getFieldValue(`areaDown${item.id}`)
                let areaUp = getFieldValue(`areaUp${item.id}`)
                resetFields([`areaDown${item.id}`, `areaUp${item.id}`])
                managerList.push({
                    areaDown,
                    areaUp,
                    id: item.id
                        ? item.id
                        : `${Date.now()}-${Math.floor(
                              Math.random(0, 1) * 10000
                          )}`,
                })
            })
        }

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
        // debugger
        console.log(managerList)
        let Arr = managerList
        let thisIndex = managerList.findIndex((item) => {
            return item.id === el.id
        })
        Arr[thisIndex + 1]['areaDown'] = Arr[thisIndex - 1]['areaUp']
        // debugger
        Arr.splice(thisIndex, 1)
        this.setState({ initData: Arr })
    }
    handleChange = (el) => {
        console.log('handleChange@el', el)
    }

    handleSubmit = (e) => {
        if (e) e.preventDefault()
        let { initData } = this.state
        let arr = []
        //不校验最后一项
        initData.forEach((item, index) => {
            let s = [`areaDown${item.id}`, `areaUp${item.id}`]
            if (index < initData.length - 1) {
                arr.push(...s)
            } else {
                if (item.areaUp) {
                    arr.push(...s)
                }
            }
        })

        this.props.form.validateFields(arr, (err, values) => {
            if (!err) {
                // const {keys, names} = values;
                console.log('Received values of form: ', values)
                this.props.form.resetFields()
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
        if (!el.areaUp) {
            return
        }
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
        // console.log(initData)
        this.collectManager(el.id)
        this.setState({
            initData,
        })
    }
    areaDownOnBlur = (el) => {
        console.log(el)
        let { initData } = this.state

        initData.forEach((item, index) => {
            if (item.id === el.id) {
                initData[index - 1].areaUp = item.areaDown
            }
        })
        // console.log(initData)
        this.collectManager(el.id)

        this.setState({
            initData,
        })
    }

    handleValidateAreaDown = (rule, value, callback) => {
        let name = rule.field
        console.log('handleValidateAreaDown@rule', rule)
        console.log('handleValidateAreaDown@value', value)

        name = name.replace('areaDown', 'areaUp')
        const { resetFields } = this.props.form

        let areaUp = this.props.form.getFieldValue(name)

        let { initData } = this.state
        let flag
        initData.forEach((item, index) => {
            if (rule.field.indexOf(item.id) > 0) {
                if (index === initData.length - 1) {
                    flag = true
                }
            }
        })
        //onBlur时不校验最后一项
        if (!flag) {
            if (Number(value) >= Number(areaUp)) {
                if (!value) {
                    callback('面积段最小值不能为空')
                } else {
                    callback('面积段最小值不能大于等于最大值')
                }
            } else {
                resetFields([`areaUp${rule.field}`])
                callback()
            }
        }
    }

    handleValidateAreaUp = (rule, value, callback) => {
        console.log('handleValidateAreaUp@rule', rule)
        console.log('handleValidateAreaUp@value', value)

        let name = rule.field
        name = name.replace('areaUp', 'areaDown')
        console.log('name', name)
        const { resetFields } = this.props.form
        let areaDown = this.props.form.getFieldValue(name)
        console.log('areaDown', areaDown)
        if (!value) {
            callback()
        }
        if (Number(value) <= Number(areaDown)) {
            resetFields([`areaUp${rule.field}`])
            callback('面积段最大值不能小于等于最小值')
        } else {
            resetFields([`areaDown${rule.field}`])
            callback()
        }
    }
    areaUpOnFocus = (param) => {
        console.log(param)
        const { resetFields } = this.props.form
        resetFields()
    }
    areaDownOnFocus = (param) => {
        console.log(param)
        const { resetFields } = this.props.form
        resetFields()
    }

    render() {
        const { getFieldDecorator } = this.props.form
        let { initData } = this.state
        console.log('render@initData', initData)
        let managerComps = initData.map((el, index) => (
            <Row span={24} key={el.id}>
                <Col span={4} >
                    <Form.Item
                        // label="areaDown："
                        // labelCol={{ span: 6 }}
                        // wrapperCol={{ span: 12 }}
						>
                        {getFieldDecorator(`areaDown${el.id}`, {
                            initialValue: el.areaDown,
                            validateTrigger: ['onBlur'],
                            rules: [
                                { whitespace: true, required: false },
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
                                onFocus={() => this.areaDownOnFocus(el)}
                                disabled={index === 0 && +el.areaDown === 0}
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={1} offset={1}>
                    <span>~</span>
                </Col>
                <Col span={4}>
                    <Form.Item
                        // label="areaUp："
                        // labelCol={{ span: 6 }}
                        // wrapperCol={{ span: 12 }}
						>
                        {getFieldDecorator(`areaUp${el.id}`, {
                            initialValue: el.areaUp,
                            validateTrigger: ['onBlur'],
                            rules: [
                                { whitespace: true, required: false },
                                { validator: this.handleValidateAreaUp },
                            ],
                        })(
                            <Input
                                onChange={() =>
                                    this.changeAsync(el).then(
                                        this._defineCallBack
                                    )
                                }
                                onBlur={() => this.areaUpOnBlur(el)}
                                onFocus={() => this.areaUpOnFocus(el)}
                                min={el.areaDown + 1}
                            />
                        )}
                    </Form.Item>
                </Col>
                <Col span={3} style={{ marginTop: 6}} offset={1}>
                    {el.areaDown && el.areaUp ? (
                        <Button
                            shape="circle"
                            size="small"
                            icon="plus"
                            type="primary"
                            style={{ marginRight: 10 }}
                            onClick={() => this.addManager(el)}
                        />
                    ) : null}
                    {index > 0 && index < initData.length - 1 && (
                        <Button
                            shape="circle"
                            size="small"
                            icon="minus"
                            type="default"
                            onClick={() => this.delManager(el)}
                        />
                    )}
                </Col>
                <Col span={4} style={{ marginTop:6 }}>
                    {index === 0 ? (
                        <div>
                            <span>({el.areaDown}</span>,
                            <span>{el.areaUp})</span>
                        </div>
                    ) : (
                        <div>
                            <span>[{el.areaDown}</span>,
                            <span>{ (index === initData.length - 1 && !el.areaUp) ? '+∞':el.areaUp})</span>
                        </div>
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
