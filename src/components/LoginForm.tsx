import React, { useState } from 'react';
import { Button, Checkbox, Form, Input, message, Space, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  LockOutlined,
  QqOutlined,
  AlipayCircleOutlined,
  WechatOutlined,
  QrcodeOutlined,
  MobileOutlined
} from '@ant-design/icons';

import authService from '../services/api/auth';
import { getResouces } from './location';
import { useAuth } from '../contexts/AuthContext';

/**
 * 登录表单组件
 */
const LoginForm: React.FC<{ to: (flag: string) => void }> = ({ to }) => {
  const navigate = useNavigate();
  const resources = getResouces();
  const { login, tempLogin } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'forget' | 'register'>('login');

  const flexStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
  };

  // 切换视图并调用外部to函数
  const switchView = (view: 'login' | 'forget' | 'register') => {
    setCurrentView(view);
    to(view);
  };

  // 显示功能未实现的提示
  const showUnimplementedMessage = (feature: string) => {
    message.info(`${feature}功能暂未实现`);
  };

  // 临时登录处理
  const handleTempLogin = () => {
    tempLogin();
    message.success('已使用临时账号登录');
    navigate('/home');
  };

  /**
   * 账号登录组件
   */
  const AccountLogin: React.FC = () => {
    const [form] = Form.useForm();
    const userName = Form.useWatch('account', form);
    const [dynamicId, setDynamicId] = useState<string>();
    const [codeSent, setCodeSent] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // 获取动态验证码
    const getDynamicCode = async () => {
      const account = form.getFieldValue('account');
      if (account && account.length > 0) {
        if (!/(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/.test(account)) {
          message.warning('请输入正确的手机号');
          return false;
        }

        const res = await authService.getDynamicCode({
          account: account,
          platName: resources.platName,
          dynamicId: '',
        });

        if (res.success && res.data) {
          setDynamicId(res.data.dynamicId);
          setCodeSent(true);
          // 设置60秒倒计时
          setCountdown(60);
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        message.warning('请先输入手机号');
      }
    };

    // 提交登录表单
    const handleSubmit = async (values: any) => {
      try {
        setLoading(true);

        // 使用AuthContext的login方法
        const success = await login(
          values.account,
          values.password,
          dynamicId || '',
          values.dynamicCode
        );

        if (success) {
          // 登录成功后跳转到首页
          navigate('/home');
          message.success('登录成功');
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item
          name="account"
          rules={[{ required: true, message: '请输入用户名/手机号' }]}>
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="请输入用户名/手机号"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="请输入密码"
          />
        </Form.Item>

        {dynamicId && <div style={{ marginBottom: 8 }}>短信验证码的编号为：{dynamicId}</div>}

        <div style={{ display: 'flex', marginBottom: 24 }}>
          <Form.Item
            name="dynamicCode"
            style={{ marginBottom: 0, flex: 1, marginRight: 8 }}
            rules={[{ required: true, message: '请输入验证码' }]}>
            <Input
              size="large"
              prefix={<LockOutlined />}
              placeholder="请输入验证码"
            />
          </Form.Item>
          <Button
            style={{ width: 120 }}
            disabled={!form.getFieldValue('account') || countdown > 0}
            size="large"
            type="primary"
            onClick={getDynamicCode}>
            {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
          </Button>
        </div>

        <Form.Item>
          <div style={flexStyle}>
            <Checkbox>记住密码</Checkbox>
            <Button type="link" onClick={handleTempLogin}>
              临时登录
            </Button>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            block
            loading={loading}
            type="primary"
            size="large"
            htmlType="submit">
            登录
          </Button>
        </Form.Item>

        <Form.Item>
          <div style={flexStyle}>
            <Button type="link" onClick={() => switchView('register')}>
              注册用户
            </Button>
            <Button
              type="link"
              onClick={() => showUnimplementedMessage('下载移动端')}>
              下载移动端
            </Button>
          </div>
        </Form.Item>
      </Form>
    );
  };

  /**
   * 二维码登录组件 - 空壳实现
   */
  const QrCodeLogin: React.FC = () => {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <QrcodeOutlined style={{ fontSize: 80, color: '#1890ff', marginBottom: 20 }} />
        <h3>二维码登录功能</h3>
        <p>该功能暂未实现</p>
        <div style={{ marginTop: 30 }}>
          <Space>
            <span style={{ fontSize: 14 }}>其它登录方式：</span>
            <AlipayCircleOutlined style={{ fontSize: 24, color: '#1677FF' }} />
            <WechatOutlined style={{ fontSize: 24, color: '#07C160' }} />
            <QqOutlined style={{ fontSize: 24, color: '#12B7F5' }} />
          </Space>
        </div>
        <Button
          type="link"
          icon={<MobileOutlined />}
          onClick={() => showUnimplementedMessage('下载移动端')}
          style={{ marginTop: 20 }}
        >
          下载移动端
        </Button>
      </div>
    );
  };

  // 忘记密码组件 - 空壳实现
  const ForgetPassword: React.FC = () => {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <h3>忘记密码功能</h3>
        <p>该功能暂未实现</p>
        <Button type="primary" onClick={() => switchView('login')}>
          返回登录
        </Button>
      </div>
    );
  };

  // 注册用户组件 - 空壳实现
  const Register: React.FC = () => {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <h3>用户注册功能</h3>
        <p>该功能暂未实现</p>
        <Button type="primary" onClick={() => switchView('login')}>
          返回登录
        </Button>
      </div>
    );
  };

  // 根据currentView显示不同的组件
  const renderContent = () => {
    switch (currentView) {
      case 'forget':
        return <ForgetPassword />;
      case 'register':
        return <Register />;
      default:
        return (
          <Tabs
            size="large"
            items={[
              { label: '账户登录', key: 'account', children: <AccountLogin /> },
              { label: '二维码登录', key: 'qrCode', children: <QrCodeLogin /> },
            ]}
          />
        );
    }
  };

  return <div>{renderContent()}</div>;
};

export default LoginForm; 