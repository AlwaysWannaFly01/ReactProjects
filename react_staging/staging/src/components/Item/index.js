import React, {Component} from 'react';
import './index.css';

class Index extends Component {
    render() {
        return (
            <li>
                <label>
                    <input type="checkbox"/>
                    <span>***</span>
                </label>
                <button className="btn btn-danger">删除</button>
            </li>
        );
    }
}

export default Index;
