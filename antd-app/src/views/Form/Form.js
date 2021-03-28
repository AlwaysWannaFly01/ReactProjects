import React, {Component} from "react";
import {Button, Modal} from "antd";
import {AreaSetModal, Test, Test2} from '@/components/AreaSetModal'

class Form extends Component {

    state = {
        AreaSetModal: false,
        AreaSetModal2: false,
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
        ]
    }
    handleShow = () => {
        this.setState({
            AreaSetModal: true
        })
    }
    handleShow2 = () => {
        this.setState({
            AreaSetModal2: true
        })
    }
    handleShow3 = () => {
        this.setState({
            AreaSetModal3:true
        })
    }
    closeCoordinate = () => {
        this.setState({
            AreaSetModal: false
        })
    }
    closeCoordinate2 = () => {
        this.setState({
            AreaSetModal2: false
        })
    }
    closeCoordinate3= () => {
        this.setState({
            AreaSetModal3: false
        })
    }
    EnterCoordinate = () => {
        const {initData} = this.child.state
        console.log("重新编排后的表单数据:", initData)
    }
    EnterCoordinate2 = () => {
        const {initData} = this.child.state
        console.log("重新编排后的表单数据:", initData)
    }
    EnterCoordinate3 = () => {
        const {initData} = this.child.state
        console.log("重新编排后的表单数据:", initData)
    }

    render() {
        return (
            <div>
                <Button type="primary" onClick={this.handleShow}>显示弹框</Button>
                <Button type="default" onClick={this.handleShow2}>显示弹框</Button>
                <Button type="danger" onClick={this.handleShow3}>显示弹框</Button>
                <Modal
                    title="面积段配置"
                    centered
                    visible={this.state.AreaSetModal}
                    width={600}
                    onOk={() => this.EnterCoordinate(true)}
                    onCancel={this.closeCoordinate}
                    bodyStyle={{maxHeight: 600, overflowY: 'auto'}}
                    cancelText='取消'
                    okText='确定'
                >
                    <AreaSetModal onRef={ref => this.child = ref} defaultData={this.state.initData}></AreaSetModal>
                </Modal>
                <Modal
                    title="面积段配置"
                    centered
                    visible={this.state.AreaSetModal2}
                    width={600}
                    bodyStyle={{maxHeight: 600, overflowY: 'auto'}}
                    onCancel={this.closeCoordinate2}
                    onOk={() => this.EnterCoordinate2(true)}
                    cancelText='取消'>
                    <Test2 onRef={ref => this.child = ref} defaultData={this.state.initData}></Test2>
                </Modal>
                <Modal
                    title="面积段配置"
                    centered
                    visible={this.state.AreaSetModal3}
                    width={600}
                    onOk={() => this.EnterCoordinate3(true)}
                    onCancel={this.closeCoordinate3}
                    bodyStyle={{maxHeight: 600, overflowY: 'auto'}}
                    cancelText='取消'
                    okText='确定'
                >
                    <Test onRef={ref => this.child = ref} defaultData={this.state.initData}></Test>
                </Modal>
            </div>
        )
    }
}

export default Form;