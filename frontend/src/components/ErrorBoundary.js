import React from 'react';
import AppStatusCard from './AppStatusCard';
import '../App.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('错误边界捕获到错误:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-status-shell">
          <AppStatusCard
            tone="error"
            eyebrow="应用发生错误"
            title="页面渲染失败"
            description={this.state.error?.message || '渲染过程中出现异常，请返回首页后重新进入。'}
            actions={[
              {
                type: 'button',
                label: '重试当前页面',
                variant: 'primary',
                onClick: this.handleReset
              },
              {
                type: 'link',
                label: '返回首页',
                variant: 'secondary',
                to: '/'
              }
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
