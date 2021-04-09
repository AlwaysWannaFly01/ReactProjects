import React, {Component} from "react";
import {Button, Modal} from "antd";
import {Test2} from '@/components/AreaSetModal'

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
    handleShow2 = () => {
        this.setState({
            AreaSetModal2: true
        })
    }
    closeCoordinate2 = () => {
        this.setState({
            AreaSetModal2: false
        })
    }
    EnterCoordinate2 = () => {
		this.child2.handleSubmit()
        const {initData} = this.child2.state
        console.log("重新编排后的表单数据:", initData)
    }

    render() {
        return (
            <div>
                <Button type="default" onClick={this.handleShow2}>显示弹框</Button>
                <Modal
                    title="面积段配置"
                    centered
                    visible={this.state.AreaSetModal2}
                    width={600}
                    bodyStyle={{maxHeight: 600, overflowY: 'auto'}}
                    onCancel={this.closeCoordinate2}
                    onOk={() => this.EnterCoordinate2(true)}
                    cancelText='取消'>
                    <Test2 onRef={ref => this.child2 = ref} defaultData={this.state.initData}></Test2>
                </Modal>
            </div>
        )
    }
}

export default Form;