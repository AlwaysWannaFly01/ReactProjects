import  './style.less'
import React from 'react'
import {message,Icon} from 'antd'
export default class ImgPreview extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      screenHeight: 0,
      screenWidth: 0,
      ratio: 1,
      angle: 0,
      defaultWidth: 'auto',
      defaultHeight: 'auto',
      imgSrc: '',
      imgList: [],
      imgIndex:0,
      posTop: 0,
      posLeft: 0,
      isAlwaysCenterZoom: false, // 是否总是中心缩放
      isAlwaysShowRatioTips: false, // 是否总是显示缩放倍数信息,默认点击按钮缩放时才显示
      flags: false,
      isDraged: false,
      position: {
        x: 0,
        y: 0
      },
      nx: '',
      ny: '',
      dx: '',
      dy: '',
      xPum: '',
      yPum: ''
    }
    this.percent = 100
  }
  
  componentDidMount() {
    this.setState({
      screenWidth: window.screen.availWidth,
      screenHeight: window.screen.availHeight,
      ratio: 1,
      angle: 0
    }, () => {
      this.getImgSize()
    })
  }
  
  componentWillReceiveProps (nextProps) {
    if(nextProps.isList){
      // nextProps.src = nextProps.images[0].thumbUrl
      this.setState({imgList:nextProps.images,imgIndex:nextProps.imgIndex})
    }
    this.setState({
      imgSrc: nextProps.src,
      isAlwaysCenterZoom: nextProps.isAlwaysCenterZoom,
      isAlwaysShowRatioTips: nextProps.isAlwaysShowRatioTips
    }, () => {
      this.getImgSize()
    })
  }
  
  // 获取预览图片的默认宽高和位置
  getImgSize = () => {
    let {ratio, isDraged, isAlwaysCenterZoom} = this.state
    let posTop = 0
    let posLeft = 0
    // 图片原始宽高
    let originWidth = this.originImgEl.width
    let originHeight = this.originImgEl.height
    // 默认最大宽高
    let maxDefaultWidth = 1000
    let maxDefaultHeight = 500
    // 默认展示宽高
    let defaultWidth = 0
    let defaultHeight = 0
    if (originWidth > maxDefaultWidth || originHeight > maxDefaultHeight) {
      if (originWidth / originHeight > maxDefaultWidth / maxDefaultHeight) {
        defaultWidth = maxDefaultWidth
        defaultHeight = Math.round(originHeight * (maxDefaultHeight / maxDefaultWidth))
        posTop = (defaultHeight * ratio / 2) * -1
        posLeft = (defaultWidth * ratio / 2) * -1
      } else {
        defaultWidth = Math.round(maxDefaultHeight * (originWidth / originHeight))
        defaultHeight = maxDefaultHeight
        posTop = (defaultHeight * ratio / 2) * -1
        posLeft = (defaultWidth * ratio / 2) * -1
      }
    } else {
      defaultWidth = originWidth
      defaultHeight = originHeight
      posTop = (defaultWidth * ratio / 2) * -1
      posLeft = (defaultHeight * ratio / 2) * -1
    }
    
    if (isAlwaysCenterZoom) {
      this.setState({
        posTop: posTop,
        posLeft: posLeft,
        defaultWidth: defaultWidth * ratio,
        defaultHeight: defaultHeight * ratio
      })
    } else {
      // 若拖拽改变过位置,则在缩放操作时不改变当前位置
      if (isDraged) {
        this.setState({
          defaultWidth: defaultWidth * ratio,
          defaultHeight: defaultHeight * ratio
        })
      } else {
        this.setState({
          posTop: posTop,
          posLeft: posLeft,
          defaultWidth: defaultWidth * ratio,
          defaultHeight: defaultHeight * ratio
        })
      }
    }
  }
  
  //上一张，下一张
  switchPic = (type='pre',e) =>{
    e.stopPropagation()
    let list = this.state.imgList
    let nums = this.state.imgList.length-1
    let index = this.state.imgIndex
    if(type==='pre'){
      if(index-1>=0){
        this.setState({
          imgSrc:list[index-1].thumbUrl,
          imgIndex:index-1
        })
      }
    }else if(type==='next'){
      if(index+1<=nums){
        this.setState({
          imgSrc:list[index+1].thumbUrl,
          imgIndex:index+1
        })
      }
    }
  }
  
  
  // 下载
  download = e => {
    e.stopPropagation()
    if(this.props.isList){
      window.open(this.state.imgList[this.state.imgIndex].response.data)
      return
    }
    window.open( this.props.picKey)
  }
  
  // 放大
  scaleBig = (type = 'click',e) => {
    if(type === 'click'){
      e.stopPropagation()
    }
    let {ratio, isAlwaysShowRatioTips} = this.state
    ratio += 0.15
    this.percent += 15
    this.setState({
      ratio: ratio
    }, () => {
      this.getImgSize()
    })
    if (isAlwaysShowRatioTips) {
      message.info(`缩放比例:${this.percent}%`, 0.2)
    } else {
      if (type === 'click') {
        message.info(`缩放比例:${this.percent}%`, 0.2)
      }
    }
  }
  
  // 缩小
  scaleSmall = (type = 'click',e) => {
    if(type === 'click'){
      e.stopPropagation()
    }
    let {ratio, isAlwaysShowRatioTips} = this.state
    ratio -= 0.15
    if (ratio <= 0.1) {
      ratio = 0.1
    }
    if (this.percent - 15 > 0) {
      this.percent -= 15
    }
    this.setState({
      ratio: ratio
    }, () => {
      this.getImgSize()
    })
    if (isAlwaysShowRatioTips) {
      message.info(`缩放比例:${this.percent}%`, 0.2)
    } else {
      if (type === 'click') {
        message.info(`缩放比例:${this.percent}%`, 0.2)
      }
    }
  }
  
  // 滚轮缩放
  wheelScale = e => {
    
    e.preventDefault()
    if (e.deltaY > 0) {
      this.scaleBig('wheel')
    } else {
      this.scaleSmall('wheel')
    }
  }
  
  // 旋转
  retate = e => {
    e.stopPropagation()
    let {angle} = this.state
    angle += 90
    this.setState({
      angle: angle
    })
  }
  
  // 按下获取当前数据
  mouseDown = event => {
    let touch
    if (event.touches) {
      touch = event.touches[0]
    } else {
      touch = event
    }
    let position = {
      x: touch.clientX,
      y: touch.clientY
    }
    this.setState({
      flags: true,
      position: position,
      dx: this.imgEl.offsetLeft,
      dy: this.imgEl.offsetTop
    })
  }
  
  mouseMove = event => {
    let {dx, dy, position, flags} = this.state
    if (flags) {
      event.preventDefault()
      let touch
      if (event.touches) {
        touch = event.touches[0]
      } else {
        touch = event
      }
      this.setState({
        isDraged: true,
        nx: touch.clientX - position.x,
        ny: touch.clientY - position.y,
        xPum: dx + touch.clientX - position.x,
        yPum: dy + touch.clientY - position.y
      }, () => {
        this.imgEl.style.left = this.state.xPum + 'px'
        this.imgEl.style.top = this.state.yPum + 'px'
      })
    }
  }
  
  mouseUp = () => {
    this.setState({
      flags: false
    })
  }
  
  mouseOut = () => {
    this.setState({
      flags: false
    })
  }
  
  // 关闭预览
  closePreview = e => {
    let {onClose} = this.props
    this.setState({
      ratio: 1,
      angle: 0,
      defaultWidth: 'auto',
      defaultHeight: 'auto',
      imgSrc: '',
      posTop: 0,
      posLeft: 0,
      flags: false,
      isDraged: false,
      position: {
        x: 0,
        y: 0
      },
      nx: '',
      ny: '',
      dx: '',
      dy: '',
      xPum: '',
      yPum: ''
    }, () => {
      this.getImgSize()
      this.percent = 100
      onClose()
    })
  }
  
  render() {
    let {screenWidth, screenHeight, posLeft, posTop, angle, imgSrc} = this.state
    let {visible} = this.props
    return (
      <div className={'preview-wrapper' + (visible ? ' show' : ' hide')} style={{width: screenWidth, height: screenHeight}}  onClick={() => {this.closePreview()}}>
        <div className='img-container'   onClick={e=> e.stopPropagation()}>
          <img className='image'
               onClick={e=> e.stopPropagation()}
               width={this.state.defaultWidth}
               height={this.state.defaultHeight}
               onWheel={this.wheelScale}
               style={{transform: `rotate(${angle}deg)`, top: posTop, left: posLeft}}
               onMouseDown={this.mouseDown}
               onMouseMove={this.mouseMove}
               onMouseUp={this.mouseUp}
               onMouseOut={this.mouseOut}
               draggable='false'
               src={imgSrc} ref={img => {this.imgEl = img}} alt="预览图片"/>
        </div>
        {/*<img className='origin-image' src={imgSrc} ref={originImg => {this.originImgEl = originImg}} alt="预览图片"/>*/}
        <img   onClick={e=> e.stopPropagation()} className='origin-image' src={imgSrc} ref={originImg => {this.originImgEl = originImg}} alt="预览图片"/>
        <div className='operate-con' onClick={e=> e.stopPropagation()}>
        {this.props.isList?(
            <div onClick={e=>this.switchPic('pre',e)} className='operate-btn' >
              <Icon type="left"   style={{color:'#fff',fontSize:26}}/>
              <span>上一张</span>
            </div>
          ):''}
          {!this.props.isList?
          <div onClick={e=>this.download(e)} className='operate-btn'>
            <Icon type="vertical-align-bottom"   style={{color:'#fff',fontSize:26}}/>
            <span>下载</span>
          </div>:''}
          <div onClick={e => {this.scaleBig('click',e)}} className='operate-btn'>
            <Icon type="zoom-in"   style={{color:'#fff',fontSize:26}}/>
            <span>放大</span>
          </div>
          <div onClick={e => {this.scaleSmall('click',e)}} className='operate-btn'>
            <Icon type="zoom-out"   style={{color:'#fff',fontSize:26}}/>
            <span>缩小</span>
          </div>
          <div onClick={e => {this.retate(e)}} className='operate-btn'>
            <Icon type="redo"  style={{color:'#fff',fontSize:26}}/>
            <span>旋转</span>
          </div>
          {this.props.isList?(
            <div onClick={e=>this.switchPic('next',e)} className='operate-btn'>
              <Icon type="right"   style={{color:'#fff',fontSize:26}}/>
              <span>下一张</span>
            </div>
          ):''}
        </div>
      </div>
    )
  }
}
