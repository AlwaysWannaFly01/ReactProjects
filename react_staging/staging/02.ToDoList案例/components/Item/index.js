import React, {Component} from 'react';
import './index.css';
import PropTypes from "prop-types";

class Item extends Component {
    static propTypes = {
        changeToDo: PropTypes.func.isRequired,
        deleteToDo: PropTypes.func.isRequired,
    }

    state = {
        mouse: false
    }

    handleMouse = (flag) => {
        return () => {
            this.setState({
                mouse: flag
            })
        }
    }

    handleCheck = (id) => {
        return (event) => {
            // console.log(event.target.checked);
            this.props.changeToDo(id, event.target.checked)
        }
    }

    handleDelete = (id) => {
        if (window.confirm('确定删除吗')) {
            this.props.deleteToDo(id)
        }
    }

    render() {
        const {id, name, done} = this.props
        const {mouse} = this.state
        return (
            <li
                onMouseEnter={this.handleMouse(true)}
                onMouseLeave={this.handleMouse(false)}
                style={{backgroundColor: mouse ? '#ddd' : '#fff'}}
            >
                <label>
                    <input type="checkbox" checked={done} onChange={this.handleCheck(id)}/>
                    <span>{name}</span>
                </label>
                <button
                    className="btn btn-danger"
                    style={{display: mouse ? 'block' : 'none'}}
                    onClick={() => this.handleDelete(id)}
                >删除
                </button>
            </li>
        );
    }
}

export default Item;
