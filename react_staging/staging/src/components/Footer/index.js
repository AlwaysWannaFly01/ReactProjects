import React, {Component} from 'react';
import './index.css';
import PropTypes from "prop-types";

class Footer extends Component {
    static propTypes = {
        checkAllToDo: PropTypes.func.isRequired,
        clearAllDone: PropTypes.func.isRequired,
    }
    handleAllCheck = (e) => {
        const {checkAllToDo} = this.props
        checkAllToDo(e.target.checked)
    }
    clearAllDone = () => {
        this.props.clearAllDone()
    }

    render() {
        const {toDos} = this.props
        const doneCount = toDos.reduce((pre, current) => pre + (current.done ? 1 : 0), 0)
        // console.log('doneCount', doneCount)
        const total = toDos.length
        return (
            <div className="todo-footer">
                <label>
                    <input type="checkbox" checked={doneCount === total && total !== 0}
                           onChange={this.handleAllCheck}/>
                </label>
                <span>
					<span>已完成{doneCount} / 全部{total}</span>
				</span>
                <button className="btn btn-danger" onClick={this.clearAllDone}>清除已完成任务</button>
            </div>
        );
    }
}

export default Footer;
