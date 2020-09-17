import React, {Component, useState, PureComponent, useMemo, memo, useCallback, useRef, useEffect} from 'react';
import './App.css';

// const Counter = memo(function Counter(props) {
//     console.log('Counter render')
//     return (
//         <h1 onClick={props.onClick}>{props.count}</h1>
//     )
// })

class Counter extends PureComponent {
    speak() {
        console.log(`now counter is :${this.props.count}`)
    }

    render() {
        const {props} = this;
        return (
            <h1 onClick={props.onClick}>{props.count}</h1>
        )

    }
}

function App(props) {
    const [count, setCount] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    let it = useRef();
    const double = useMemo(() => {
        return count * 2
    }, [count === 3]);

    const counterRef = useRef();

    const onClick = useCallback(() => {
        console.log('click')
        setClickCount((clickCount) => clickCount + 1);

        counterRef.current.speak();
    }, [clickCount])

    useEffect(() => {
        it.current = setInterval(() => {
            setCount(count => count + 1)
        }, 1000)
    }, [])

    useEffect(()=>{
        if(count>=10){
            clearInterval(it.current)
        }
    })

    /*
    * useMemo(() => fn)
    * useCallback(fn)
    * */
    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    setCount(count + 1)
                }}>
                Click({count}),double({double})
            </button>
            <Counter count={double} onClick={onClick} ref={counterRef}></Counter>
        </div>
    )
}

export default App;
