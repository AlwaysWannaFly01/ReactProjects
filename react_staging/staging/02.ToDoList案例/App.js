import React, {Component} from 'react';
import './App.css'
import Header from './components/Header'
import List from './components/List'
import Footer from './components/Footer'

export default class App extends Component {
    state = {
        toDos: [
            {id: '001', name: '白酒', done: true},
            {id: '002', name: '医疗', done: true},
            {id: '003', name: '基建', done: false},
        ]
    }

    addToDo = (toDo) => {
        // console.log('toDo', toDo)
        const {toDos} = this.state
        const newTodos = [toDo, ...toDos]
        this.setState({
            toDos: newTodos
        })
    }

    changeToDo = (id, done) => {
        // console.log(id);
        // console.log(done);
        const {toDos} = this.state
        const newToDos = toDos.map(toDo => {
            if (toDo.id === id) return {...toDo, done}
            else return toDo
        })
        this.setState({
            toDos: newToDos
        })
    }

    deleteToDo = (id) => {
        // console.log(id)
        const {toDos} = this.state
        const newToDos = toDos.filter(toDoObj => {
            return toDoObj.id !== id
        })
        this.setState({
            toDos: newToDos
        })
    }

    checkAllToDo = (flag) => {
        const {toDos} = this.state
        const newToDos = toDos.map(toDo => {
            return {...toDo, done: flag}
        })
        // console.log(newToDos)
        this.setState({
            toDos: newToDos
        })
    }

    clearAllDone = () => {
        const {toDos} = this.state
        const newToDos = toDos.filter(toDo => {
            return !toDo.done
        })
        this.setState({
            toDos: newToDos
        })
    }

    render() {
        const {toDos} = this.state
        return (
            <div className="todo-container">
                <div className="todo-wrap">
                    <Header addToDo={this.addToDo}/>
                    <List toDos={toDos} changeToDo={this.changeToDo} deleteToDo={this.deleteToDo}/>
                    <Footer toDos={toDos} checkAllToDo={this.checkAllToDo} clearAllDone={this.clearAllDone}/>
                </div>
            </div>
        )
    }
}
