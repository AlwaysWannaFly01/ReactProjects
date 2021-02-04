import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ContextMenu.less'

class ContextMenu extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      id: props.id,
      status: props.status,
      url: props.url,
    }
  }

  componentDidMount() {
    document.addEventListener('contextmenu', this.handleContextMenu)
    document.addEventListener('click', this.handleClick)
    document.addEventListener('DOMMouseScroll', this.handleScroll)
  }

  componentWillUnmount() {
    document.removeEventListener('contextmenu', this.handleContextMenu)
    document.removeEventListener('click', this.handleClick)
    document.removeEventListener('DOMMouseScroll', this.handleScroll)
  }

  handleContextMenu = event => {
    event.preventDefault()
    this.setState({ visible: true })
    const clickX = event.clientX
    const clickY = event.clientY
    const screenW = window.innerWidth
    const screenH = window.innerHeight
    const rootW = this.root.offsetWidth
    const rootH = this.root.offsetHeight
    const right = screenW - clickX > rootW
    const left = !right
    const top = screenH - clickY > rootH
    const bottom = !top
    if (right) {
      this.root.style.left = `${clickX + 5}px`
    }
    if (left) {
      this.root.style.left = `${clickX - rootW - 5}px`
    }
    if (top) {
      this.root.style.top = `${clickY + 5}px`
    }
    if (bottom) {
      this.root.style.top = `${clickY - rootH - 5}px`
    }
  }

  handleClick = event => {
    const { visible } = this.state
    const wasOutside = !(event.target.contains === this.root)
    if (wasOutside && visible) this.setState({ visible: false })
  }

  handleScroll = () => {
    const { visible } = this.state
    if (visible) this.setState({ visible: false })
  }

  render() {
    const {
      visible, id, status, url
    } = this.state
    return (
      <div>
        {visible ? (
          <div
            ref={ref => {
              this.root = ref
            }}
            className={styles.contextMenu}
            style={{ display: this.state.visible ? 'true' : 'false' }}
          >
            <a className={styles.contextMenuOption} href={`${url}?projectId=${id}&prjStatus=${status}`} target="blank">
              在新标签页中打开链接
            </a>
            <div className={styles.contextMenuOption}>abc</div>
          </div>
        ) : null}
      </div>
    )
  }
}

export default ContextMenu
