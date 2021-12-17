import React from 'react';

class Page1 extends React.Component {
    render() {
        let mystyle = {
            width: '100%',
            height: '80px',
            backgroundColor: 'pink',
            fontSize: '24px',
            textAlign: 'center',
            lineHeight: '80px'
        };
        console.log(this, this.props);
        return (
            <div style={mystyle}>
                This is Page 111111!
            </div>
        );
    }
}

export default Page1;
