import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; height?: number }
type State = { error: string | null }

/** Prevents map failures from crashing the whole page */
export default class MapErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(err: Error) {
    return { error: err?.message || 'Map error' }
  }

  componentDidCatch(err: Error) {
    console.error('MapErrorBoundary', err)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            height: this.props.height || 320,
            minHeight: 200,
            background: '#0a1628',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            padding: 16,
            textAlign: 'center',
          }}
        >
          Map could not load. Other page features still work.
          <br />
          <span style={{ opacity: 0.7, fontSize: 11 }}>{this.state.error}</span>
        </div>
      )
    }
    return this.props.children
  }
}
