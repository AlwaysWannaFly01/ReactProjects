import React, {Component, useState, PureComponent, useMemo, memo, useCallback, useRef, useEffect} from 'react';
import './App.css';
import {
    createAdd,
    createSet,
    createRemove,
    createToggle
} from "./action";

let idSeq = Date.now();

function bindActionCreators(actionCreators, dispatch) {
    const ret = {};
    for (let key in actionCreators) {
        ret[key] = function (...args) {
            const actionCreator = actionCreators[key];
            const action = actionCreator(...args);
            dispatch(action)
        }
    }
    return ret;
}

const Control = memo(function Control(props) {
    const {addTodo} = props;
    const inputRef = useRef();

    const onSubmit = (e) => {
        e.preventDefault();
        const newText = inputRef.current.value.trim();
        if (newText.length === 0) {
            return
        }

        addTodo({
            id: ++idSeq,
            text: newText,
            complete: false
        })

        inputRef.current.value = '';
    }

    return (
        <div className="control">
            <h1>todos</h1>
            <form action="" onSubmit={onSubmit}>
                <input ref={inputRef} type="text" className="new-todo" placeholder='what needs to be done?'/>
            </form>
        </div>
    )
})

const TodoItem = memo(function TodoItem(props) {
    const {
        todo: {
            id, text, complete
        },
        removeTodo,
        toggleTodo,
    } = props;

    const onChange = () => {
        toggleTodo(id)
    };
    const onRemove = () => {
        removeTodo(id)
    };

    return (
        <li className="todo-item">
            <input type="checkbox" onChange={onChange} checked={complete}/>
            <label className={complete ? 'complete' : ''}>{text}</label>
            <button onClick={onRemove}>&#xd7;</button>
        </li>
    )

})

const Todos = memo(function Todos(props) {
    const {todos, removeTodo, toggleTodo} = props;
    return (
        <ul>
            {
                todos.map(todo => {
                    return <TodoItem todo={todo} key={todo.id} removeTodo={removeTodo} toggleTodo={toggleTodo}/>
                })
            }
        </ul>
    )
})

const LS_KEY = '$-todos'

function App() {
    const [todos, setTodos] = useState([]);
    const {incrementCount, setIncrementCount} = useState(0);

    const addTodo = (todo) => {
        setTodos(todos => [...todos, todo])
    }

    const removeTodo = useCallback(
        (id) => {
            setTodos(todos => todos.filter(todo => {
                return todo.id !== id
            }))
        }, [])

    const toggleTodo = useCallback(
        (id) => {
            setTodos(todos => todos.map(todo => {
                return todo.id === id ? {
                    ...todo,
                    complete: !todo.complete
                } : todo
            }))
        }
    )

    function reducer(state, action) {
        const {type, payload} = action;
        const {todos, incrementCount} = state;

        switch (type) {
            case 'set':
                return {
                    ...state,
                    todos: payload,
                    incrementCount: incrementCount + 1
                }
            case 'add':
                return {
                    ...state,
                    todos: [...todos, payload],
                    incrementCount: incrementCount + 1
                }

            case 'remove':
                return {
                    ...state,
                    todos: todos.filter(todo => {
                        return todo.id !== payload
                    })
                }
            case 'toggle':
                return {
                    ...state,
                    todos: todos.map(todo => {
                        return todo.id === payload ? {
                            ...todo,
                            complete: !todo.complete
                        } : todo
                    })
                }
        }
        return state;
    }

    const dispatch = useCallback((action) => {
        const state = {
            todos,
            incrementCount
        }
        console.log(setTodos)
        const setters = {
            todos: setTodos,
            incrementCount: setIncrementCount
        }

        // console.log(setters.todos)
        const newState = reducer(state, action);
        console.log(newState)

        for (let key in newState) {
            setters[key](newState[key])
        }

    }, [todos, incrementCount])

    useEffect(() => {
        const todos = JSON.parse(localStorage.getItem(LS_KEY));
        dispatch(createSet(todos));
    }, [])

    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(todos))
    }, [todos])


    return (
        <div className="todo-list">
            <Control
                {
                    ...bindActionCreators({
                        addTodo: createAdd
                    }, dispatch)
                }
            />
            <Todos

                {
                    ...bindActionCreators({
                        removeTodo: createRemove,
                        toggleTodo: createToggle
                    }, dispatch)
                }

                todos={todos}

            />
        </div>
    )
}

export default App;
