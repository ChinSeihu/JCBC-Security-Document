"use client"
import React from 'react';
import { Image, Layout, theme, Typography } from 'antd';
import Navbar from '@/components/Navbar';
import SideMenu from '@/components/Menu';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()


  return (
    <Layout style={{ height: '100%' }}>
      <Sider
        theme="light"
        collapsible
        breakpoint="sm"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="mt-3 mb-3 ml-1 flex items-center" >
          <Image src='/logo.png' alt='logo' width={40} height={40}/>
          <Title level={5} style={{ margin: '4px 0 0 12px'}}>TITLE SECTION</Title>
        </div>
        <SideMenu />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, height: 50, background: colorBgContainer }}>
          <Navbar />
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              height: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflowY: 'auto'
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', padding: '6px 50px' }}>
          JCBC ©{new Date().getFullYear()} Created by xxx
        </Footer>
      </Layout>
    </Layout>
  );
}
