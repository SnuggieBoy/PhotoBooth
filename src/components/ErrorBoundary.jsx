import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white border-2 border-pink-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-pink-100 text-[#FF3D96] flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle size={30} />
            </div>

            <h3 className="text-xl font-black text-[#29252C]">
              Đã có sự cố nhỏ xảy ra ✨
            </h3>

            <p className="text-xs text-[#766F7B] leading-relaxed">
              Trình duyệt vừa gặp gián đoạn bộ nhớ hoặc lỗi xử lý. Đừng lo, bạn có thể quay lại để tiếp tục chụp nhé!
            </p>

            {this.state.error?.message && (
              <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 text-[11px] font-mono text-pink-600 break-words text-left max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3.5 px-4 rounded-full bg-gradient-to-r from-[#FF3D96] to-[#FF6BA8] hover:from-[#E62E84] text-white font-black text-xs shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Bắt đầu lại</span>
              </button>
              <button
                onClick={() => { window.location.href = '/' }}
                className="py-3.5 px-4 rounded-full bg-[#FFF7EF] hover:bg-pink-50 border border-pink-100 text-[#29252C] font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Home size={14} />
                <span>Trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
