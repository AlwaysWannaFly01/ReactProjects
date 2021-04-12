import React, {Component} from "react";
import {Button, Modal, Input, Radio, Form} from "antd";
import {AreaSetModal2} from '@/components/AreaSetModal'

class Form2 extends Component {
    state = {
        AreaSetModal: false,
        initData: [
            {
                areaDown:'0',
                areaUp:'10',
                id: '1'
            },
            {
                areaDown:'20',
                areaUp:'30',
                id: '2'
            },
        ],
        visible: false,
    }
    handleShow = () => {
        // this.setState({
        //     AreaSetModal: true
        // })
        this.setState({ visible: true });
    }

    // showModal = () => {
    //     this.setState({ visible: true });
    // };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    handleCreate = () => {
        console.log(1233)
        const { form } = this.formRef.props;
        form.validateFields((err, values) => {
            console.log(values)
            if (err) {
                console.log(err)
                return;
            }
            console.log('Received values of form: ', values);
            form.resetFields();
            this.setState({ visible: false });
        });
    };

    saveFormRef = formRef => {
        this.formRef = formRef;
    };


    closeCoordinate = () => {
        this.setState({
            AreaSetModal: false
        })
    }
    EnterCoordinate = () => {
		this.child.handleSubmit()
        const {initData} = this.child.state
        console.log("重新编排后的表单数据:", initData)
    }

    aaa = () => {
        return (
            <div>
                <h2>想要你在身边</h2>
            </div>
        )
    }
    render() {
        return (
            <div>
                <Button type="default" onClick={this.handleShow}>显示弹框</Button>
                {/*<Modal*/}
                {/*    title="面积段配置"*/}
                {/*    centered*/}
                {/*    visible={this.state.AreaSetModal}*/}
                {/*    width={600}*/}
                {/*    bodyStyle={{maxHeight: 600, overflowY: 'auto'}}*/}
                {/*    onCancel={this.closeCoordinate}*/}
                {/*    onOk={() => this.EnterCoordinate(true)}*/}
                {/*    cancelText='取消'>*/}
                {/*    <AreaSetModal onRef={ref => this.child = ref} defaultData={this.state.initData}></AreaSetModal>*/}
                {/*</Modal>*/}

                {/*<CollectionCreateForm*/}
                {/*    wrappedComponentRef={this.saveFormRef}*/}
                {/*    visible={this.state.visible}*/}
                {/*    onCancel={this.handleCancel}*/}
                {/*    onCreate={this.handleCreate}*/}
                {/*    initData={this.state.initData}*/}
                {/*/>*/}
                {
                    this.state.visible&&<AreaSetModal2
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        defaultData={this.state.initData}
                        childData = {this.aaa()}
                    >
                    </AreaSetModal2>
                }

            </div>
        )
    }
}

export default Form2;
