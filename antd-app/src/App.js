import './App.scss';
import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import {Layout, Menu, Breadcrumb, Icon} from 'antd';
import {Test} from './views'

const {Content, Footer, Sider} = Layout;
const {SubMenu} = Menu;


class App extends React.Component {
    render() {
        return (
            <Router>
                <Layout style={{minHeight: '100vh'}} className="_layout">
                    <Sider>
                        <div className="logo"/>
                        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                            <Menu.Item key="1">
                                <Icon type="pie-chart"/>
                                <Link to="/">Home</Link>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <Icon type="desktop"/>
                                <Link to="/">part2</Link>
                            </Menu.Item>
                            <SubMenu
                                key="sub1"
                                title={
                                    <span>
                                      <Icon type="user"/>
                                      <span>User</span>
                                    </span>
                                }
                            >
                                <Menu.Item key="3">
                                    <Link to="/">part3</Link>
                                </Menu.Item>
                            </SubMenu>
                            <SubMenu
                                key="sub2"
                                title={
                                    <span>
                                        <Icon type="team"/>
                                        <span>Team</span>
                                    </span>
                                }
                            >
                                <Menu.Item key="4">
                                    <Link to="/">part4</Link>
                                </Menu.Item>
                            </SubMenu>
                            <Menu.Item key="9">
                                <Icon type="file"/>
                                <Link to="/form">Form</Link>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Layout>

                        <Content style={{margin: '0 16px'}}>
                            <Breadcrumb style={{margin: '16px 0'}}>
                                <Breadcrumb.Item>User</Breadcrumb.Item>
                                <Breadcrumb.Item>Bill</Breadcrumb.Item>
                            </Breadcrumb>
                            <div style={{padding: 24, background: '#fff', minHeight: 360}}>
                                <Switch>
                                    <Route path="/" exact component={Home}></Route>
                                    <Route path="/form" component={Test}></Route>
                                </Switch>
                            </div>
                        </Content>
                        <Footer style={{textAlign: 'center'}}>Ant Design ©2018 Created by Ant UED</Footer>
                    </Layout>
                </Layout>
            </Router>
        );
    }
}

function Home() {
    return <h2>Home222</h2>;
}


export default App;
