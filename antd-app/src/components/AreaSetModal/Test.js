import React, {Component} from 'react'
import {Form, Input, Icon, Button, Row, Col} from 'antd';
import {compose} from "redux";

let id = 0;

class Test extends Component {
    remove = k => {
        const {form} = this.props;
        const keys = form.getFieldValue('keys');
        if (keys.length === 1) {
            return;
        }

        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    };

    add = () => {
        const {form} = this.props;
        const keys = form.getFieldValue('keys');
        console.log(keys)
        const nextKeys = keys.concat(id++);
        form.setFieldsValue({
            keys: nextKeys,
        });
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {keys, names} = values;
                console.log('Received values of form: ', values);
                console.log('Merged values:', keys.map(key => names[key]));
            }
        });
    };

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
                xs: {span: 24},
                sm: {span: 20},
            },
        };
        getFieldDecorator('keys', {initialValue: []});
        const keys = getFieldValue('keys');
        console.log(keys)
        const formItems = keys.map((k, index) => (
            <Row key={k}>
                <Col span={6}>
                    <Form.Item
                        {...formItemLayout}
                        required={false}
                        key={k}
                    >
                        {getFieldDecorator(`names[${k}]`, {
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [
                                {
                                    required: true,
                                    whitespace: true,
                                    message: "Please input passenger's name or delete this field.",
                                },
                            ],
                        })(
                            <Input min={0} placeholder="输入数字" style={{width: '100px', marginRight: 8}}/>
                        )}
                    </Form.Item>
                </Col>
                <Col span={2}>
                    ~
                </Col>
                <Col span={14}>
                    <Form.Item
                        {...formItemLayout}
                        required={false}
                        key={k}
                    >
                        {getFieldDecorator(`names[${k}]`, {
                            validateTrigger: ['onChange', 'onBlur'],
                            rules: [
                                {
                                    required: true,
                                    whitespace: true,
                                    message: "Please input passenger's name or delete this field.",
                                },
                            ],
                        })(
                            <Input min={0} placeholder="输入数字" style={{width: '100px', marginRight: 8}}/>
                        )}
                        {keys.length > 1 ? (
                            <Icon
                                className="dynamic-delete-button"
                                type="minus-circle-o"
                                onClick={() => this.remove(k)}
                            />
                        ) : null}
                    </Form.Item>
                </Col>

            </Row>
        ));
        return (
            <Form onSubmit={this.handleSubmit}>
                {formItems}
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button type="dashed" onClick={this.add} style={{width: '60%'}}>
                        <Icon type="plus"/> Add field
                    </Button>
                </Form.Item>
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default compose(
    Form.create()
)(Test)