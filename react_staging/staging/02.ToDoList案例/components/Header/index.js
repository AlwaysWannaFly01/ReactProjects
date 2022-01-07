import React, {Component} from 'react';
import {nanoid} from 'nanoid';//nanoid库和uuid库一样都可以生成uuid，但是nanoid相比uuid要更轻量级
import PropTypes from 'prop-types'
import './index.css';

class Header extends Component {
    static propTypes = {
        addToDo: PropTypes.func.isRequired
    }

    handleKeyUp = (e) => {
        const {keyCode, target} = e
        if (keyCode !== 13) return
        // console.log(target.value)
        if (target.value.trim() === '') {
            alert('输入不能为空')
            return
        }
        const {addToDo} = this.props
        const toDoObj = {id: nanoid(), name: target.value, done: false}
        addToDo(toDoObj)
    }

    render() {
        return (
            <div className="todo-header">
                <input type="text" placeholder="请输入你的任务名称，按回车键确认" onKeyUp={this.handleKeyUp}/>
            </div>
        );
    }
}

export default Header;
