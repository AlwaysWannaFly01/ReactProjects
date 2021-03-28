import React, {Component} from 'react'
import {Form, Input, Button, Row, Col} from 'antd';
import {compose} from "redux";
class Test2 extends Component {
    constructor(props) {
        super(props);
        this.state = {
            initData: this.props.defaultData,
        };
    }

    componentDidMount() {
        this.props.onRef(this)
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps)
        console.log(this.props)
        if(nextProps.defaultData !== this.props.defaultData){

        }
    }

    componentWillUpdate(nextProps, nextState) {
        console.log(nextProps)
        console.log(nextState)
        if (nextProps.defaultData.length !== nextState.initData.length && nextProps.defaultData !== nextState.initData) {

        }
    }

    collectManager = () => {
        const {getFieldValue, resetFields} = this.props.form;
        const managerList = [];
        const {initData} = this.state
        initData.forEach((item) => {
            let areaDown = getFieldValue(`areaDown${item.id}`);
            let areaUp = getFieldValue(`areaUp${item.id}`);
            console.log('collectManager@areaDown', areaDown)
            console.log('collectManager@areaUp', areaUp)
            resetFields([`areaDown${item.id}`, `areaUp${item.id}`]);
            managerList.push({
                areaDown,
                areaUp,
                id: item.id ? item.id : `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000)}`
            });
        })

        console.log(managerList)
        return managerList;
    }

    addManager = (el) => {
        let managerList = this.collectManager();
        console.log(managerList)
        console.log('添加的那一项el', el)

        let thisIndex = managerList.findIndex((item) => {
            return item.id === el.id;
        });
        let recom = {
            areaDown: el.areaUp,
            areaUp: '',
            id: `${Date.now()}-${Math.floor(Math.random(0, 1) * 10000)}`,
        }
        managerList.splice(thisIndex + 1, 0, recom)
        console.log(managerList)

        this.setState({initData: managerList});
    }

    delManager = (index) => {
        let managerList = this.collectManager();

        //删除指定index的元素
        managerList.splice(index, 1);
        this.setState({initData: managerList});
    }
    handleChange =  (el) => {
        console.log('handleChange@el', el)

        const {getFieldValue, resetFields} = this.props.form;
        const _a = `areaDown${el.id}`
        const _b = `areaUp${el.id}`
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

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {keys, names} = values;
                console.log('Received values of form: ', values)
            }
        });
    };

    areaUpBlur = async (el) => {
        console.log('areaUpBlur@el', el)

        const values = this.props.form.getFieldsValue()
        console.log(values)
    }
    aaa = () => {
        const values = this.props.form.getFieldsValue()
        console.log(values)
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        let {initData} = this.state;
        console.log(initData)
        let managerComps = initData.map((el, index) => (
            <Row span={24} key={el.id}>
                <Col span={8}>
                    <Form.Item
                        label="areaDown："
                        labelCol={{span: 10}}
                        wrapperCol={{span: 12}}>
                        {getFieldDecorator(`areaDown${el.id}`, {
                            initialValue: el.areaDown,
                            rules: [{
                                required: false,
                            }]
                        })(
                            <Input/>
                        )}
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        label="areaUp："
                        labelCol={{span: 8}}
                        wrapperCol={{span: 12}}>
                        {getFieldDecorator(`areaUp${el.id}`, {
                            initialValue: el.areaUp,
                            rules: [{
                                required: false,
                            }],
                            // getValueFromEvent: obj => {
                            //     console.log(obj)
                            // }
                        })(
                            <Input onChange = {()=>this.areaUpBlur(el).then(this.aaa)}/>
                        )}
                    </Form.Item>
                </Col>
                <Col span={4} style={{marginTop: 6}}>
                    {<Button shape="circle" size="small" icon="plus" type="primary" style={{marginRight: 10}}
                             onClick={() => this.addManager(el)}/>}
                    {((initData > 1 && index === 0) || index > 0) &&
                    <Button shape="circle" size="small" icon="minus" type="default"
                            onClick={() => this.delManager(index)}/>}
                </Col>
            </Row>
        ));

        return (
            <Form onSubmit={this.handleSubmit}>
                <div>
                    {managerComps}
                </div>
                <Form.Item >
                    <Button type="primary" htmlType="submit">
                        确认
                    </Button>
                </Form.Item>
            </Form>
        )
    }
}

export default compose(
    Form.create()
)(Test2)