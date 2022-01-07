import React, {Component} from 'react';
import './index.css';
import Item from '../Item/index';

class Index extends Component {
    render() {
        return (
            <ul className="todo-main">
                <Item/>
            </ul>
        );
    }
}

export default Index;
