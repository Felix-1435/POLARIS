import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; height?: number }
type State = { hasError: boolean }

export default class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(e: Error) {
    console.error('MapErrorBoundary', e)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: this.props.height || 300,
            background: '#0a1628',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
          }}
        >
          Map unavailable — rest of page still works
        </div>
      )
    }
    return this.props.children
  }
}
