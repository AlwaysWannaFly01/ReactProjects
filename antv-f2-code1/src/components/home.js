import React from 'react';
import { Link } from 'react-router-dom';

class Home extends React.Component {
    render() {
        return (
            <div>
                <p>This is Home!</p>
                <Link to="/page1/monica">
                    <div>点击跳转到Page1</div>
                </Link>
                <Link to="/f2demo">
                    <div>点击跳转到F2Demo</div>
                </Link>
                <Link to="/f2demo2">
                    <div>点击跳转到F2Demo2</div>
                </Link>
            </div>
        );
    }
}

export default Home;
