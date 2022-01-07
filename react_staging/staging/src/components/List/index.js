import React, {Component} from 'react';
import './index.css';
import Item from '../Item/index';
import PropTypes from "prop-types";

class List extends Component {
    static propTypes = {
        toDos: PropTypes.array.isRequired,
        changeToDo: PropTypes.func.isRequired,
        deleteToDo: PropTypes.func.isRequired,
    }

    render() {
        const {toDos, changeToDo, deleteToDo} = this.props
        return (
            <ul className="todo-main">
                {
                    toDos.map(item => {
                        return <Item key={item.id} {...item} changeToDo={changeToDo} deleteToDo={deleteToDo}/>
                    })
                }
            </ul>
        );
    }
}

export default List;
