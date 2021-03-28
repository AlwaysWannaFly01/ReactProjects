/* eslint-disable */
import React, {Component} from 'react'
import {Button, Input, Icon, Form, Row, Col} from 'antd'


import styles from './AreaSetModal.scss'
import {compose} from "redux"

class AreaSetModal extends Component {

    constructor(props) {
        super(props)
        this.state = {
            initData: this.props.defaultData
        }
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.defaultData)
        if (nextProps.defaultData !== this.props.defaultData) {
            this.setState({
                initData: nextProps.defaultData,
            })
        }
    }

    remove = (param) => {

    };

    add = (param) => {
        console.log(param)
        let nextKeys = []
        let {initData} = this.state
        console.log('add@initData', initData)
        debugger
        if (param !== null) {
            if (initData.length === 1) {
                let recom = [
                    {
                        areaDown: 0,
                        areaUp: '',
                        id: param.id,
                    },
                    {
                        areaDown: '',
                        areaUp: Infinity,
                        id: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000)}`,
                    },
                ]
                this.setState({
                    initData: recom
                })

            } else {
                let recom = {
                    areaDown: param.areaUp,
                    areaUp: '',
                    id: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000)}`,
                }
                nextKeys = initData
                let thisIndex = nextKeys.findIndex((item) => {
                    return item.id === param.id;
                });
                // console.log(thisIndex)

                nextKeys.splice(thisIndex + 1, 0, recom)
                // console.log(nextKeys)

                // nextKeys[thisIndex]['areaDown'] = param.areaDown
                console.log(nextKeys)

                this.setState({
                    initData: nextKeys
                }, () => {
                    console.log(this.state.initData)
                    // this.props.form.resetFields();
                })
            }

        } else {
            let obj = {
                areaDown: 0,
                areaUp: Infinity,
                id: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000)}`,
            }
            nextKeys.push(obj)
            nextKeys = initData.concat(obj);
            console.log(nextKeys)
            if (nextKeys.length > 0) {
                this.setState({
                    initData: nextKeys
                })
            }
        }
    };


    handleValidateAreaDown = (rule, value, callback) => {
        let vm = this
        let name = rule.field
        name = name.replace("areaDown", "areaUp")
        let areaUp = vm.props.form.getFieldsValue([`${name}`]).areaUp
        if (Number(value) >= Number(areaUp[areaUp.length - 1])) {
            callback("面积段最小值不能大于等于最大值")
        } else {
            callback()
        }
    }

    handleValidateAreaUp = (rule, value, callback) => {
        let vm = this
        let name = rule.field
        name = name.replace("areaUp", "areaDown")
        let areaDown = vm.props.form.getFieldsValue([`${name}`]).areaDown
        if (Number(value) <= Number(areaDown[areaDown.length - 1])) {
            callback("面积段最大值不能小于等于最小值")
        } else {
            callback()
        }
        //callback()
    }

    handleSubmit = e => {
        e.preventDefault();
    };

    componentWillUpdate(nextProps, nextState, nextContext) {

    }

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 4},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span: 24, offset: 0},
                sm: {span: 20, offset: 4},
            },
        };

        let initData = this.state.initData
        console.log('render@initData', initData)
        const formItems = initData.map((piece, pieceIndex) => (
            <Row key={piece.id} style={{marginBottom: 2}}>
                <Col span={5}>
                    <Form.Item
                        required={false}
                    >
                        {getFieldDecorator(`areaDown[${piece.id}]`, {
                            validateTrigger: ['onBlur'],
                            rules: [
                                {whitespace: true, required: false},
                                {validator: this.handleValidateAreaDown}
                            ],
                            initialValue: piece.areaDown ? piece.areaDown.toString() : pieceIndex === 0 ? '0' : piece.areaDown.toString()
                        })(<Input min={0} placeholder="输入数字" style={{width: '70px', marginRight: 8}}/>)
                        }
                    </Form.Item>
                </Col>
                <Col span={1}>
                    ~
                </Col>
                <Col span={6}>
                    <Form.Item
                        required={false}
                    >
                        {getFieldDecorator(`areaUp[${piece.id}]`, {
                            validateTrigger: ['onBlur'],
                            rules: [
                                {whitespace: true, required: false},
                                {validator: this.handleValidateAreaUp}
                            ],
                            initialValue: piece.areaUp ? (piece.areaUp === Infinity ? ('+∞') : piece.areaUp) : ''
                        })(<Input placeholder="输入数字" min={piece.areaDown + 1}
                                  style={{width: '70px', marginRight: 8, marginLeft: 8}}/>)
                        }
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <div className={styles.btnGrou}>
                        {
                            initData.length === 1 ?
                                (
                                    <div>
                                        <Icon
                                            className="dynamic-delete-button"
                                            style={{marginRight: '10px'}}
                                            type="plus-circle-o"
                                            onClick={() => this.add(piece)}
                                        />
                                        <Icon className="dynamic-delete-button"
                                              type="minus-circle-o"
                                              onClick={() => this.remove(piece)}
                                        />
                                    </div>

                                ) : (
                                    pieceIndex === initData.length - 1 ?
                                        null : (
                                            <div>
                                                <Icon
                                                    className="dynamic-delete-button"
                                                    style={{marginRight: '10px'}}
                                                    type="plus-circle-o"
                                                    onClick={() => this.add(piece)}
                                                />
                                                <Icon className="dynamic-delete-button"
                                                      type="minus-circle-o"
                                                      onClick={() => this.remove(piece)}
                                                />
                                            </div>
                                        )
                                )
                        }

                    </div>
                </Col>
            </Row>
        ));
        return (
            <div className={styles.AreaSetModal}>
                <Form onSubmit={this.handleSubmit}>
                    {formItems}
                    <Form.Item style={{display: initData.length === 0 ? 'block' : 'none'}}>
                        <Button type="dashed" onClick={() => this.add(null)} style={{width: '47.6%'}}>
                            <Icon type="plus"/> Add
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

export default compose(
    Form.create()
)(AreaSetModal)
