import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Table,
  Button,
  Modal,
  Input,
  Form,
  Upload,
  Message,
  Alert,
  Select,
  Breadcrumb,
  Icon,
  Popover
} from 'antd'
import { parse } from 'qs'
import Immutable from 'immutable'
import { pagePermission } from 'client/utils'

import router from 'client/router'
import showTotal from 'client/utils/showTotal'
import layout from 'client/utils/layout'
import * as config from 'client/config'
import actions, { containerActions } from './actions'
import { modelSelector } from './selector'
import './sagas'
import './reducer'

import styles from './ProImage.less'
import ImgPreview from 'client/components/ImgPreview/ImgPreview'
import ImgPreviewList from 'client/components/ImgPreview/ImgPreview'
import md5 from 'js-md5'
const confirm = Modal.confirm
const FormItem = Form.Item
const { Option } = Select



/**
 * 住宅 项目图片
 * author: YJF
 * 入口来源: 1.楼盘列表,参数楼盘ID；2.楼栋列表,参数楼盘ID,楼栋ID
 */

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}
// 上传的次数，可以统计到多少个文件
let beforeUploadCounter = 0
// 上传文件个数+当前文件列表个数
let allFilesLength = 0
// 是否继续上传
let continueUpload = true

class ProImage extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    getProjectImageList: PropTypes.func.isRequired,
    projectImageList: PropTypes.array.isRequired,
    delProjectImages: PropTypes.func.isRequired,
    model: PropTypes.instanceOf(Immutable.Map).isRequired,
    getProjectDetail: PropTypes.func.isRequired,
    getBuildDetail: PropTypes.func.isRequired,
    updateVisitCities: PropTypes.func.isRequired,
    getPhotoType: PropTypes.func.isRequired, // 图片类型
    editPhoto: PropTypes.func.isRequired, // 图片编辑
    pictureSave: PropTypes.func.isRequired // 图片保存
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
    loading: PropTypes.instanceOf(Immutable.List).isRequired
  }

  constructor(props) {
    super(props)

    const {
      projectId = '',
      buildingId = '',
      cityId = '',
      cityName = ''
    } = parse(props.location.search.substr(1))

    this.state = {
      projectId,
      buildingId,
      selectedRowKeys: [],
      imageVisible: false,
      // 展示图片地址
      imageAddr: '',
      cityId,
      cityName,
      visibleEdit: false,
      editDate: {},
      previewVisible: false,
      // 新增弹窗
      visibleAdd: false,
      // S上传照片
      previewImage: '',
      imageButtonDis:false,
      imageBuildButtonDis:false,
      // photoTypePara: '',
      fileList: [
        // {
        //   uid: '-1',
        //   name: 'xxx.png',
        //   status: 'done',
        //   url:
        //     'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        // }
      ],
      // beforeUploadCounter: 0,
      // allFilesLength: 0,
      // continueUpload: true
      // E上传照片
      imgIndex:0,
      MD5List:[],
      ADDLIST:[],
      TYPELIST:[],
      dataImageList:[],
    }

    const qry = {
      pageNum: 1,
      pageSize: 20,
      projectId,
      buildingId,
      cityId: this.state.cityId
    }
    props.getProjectImageList(qry,res=>{
      this.setState({
        dataImageList:res
      })
    })
  }

  componentDidMount() {
    const { cityId, cityName } = this.state
    this.cityIdInterval = setInterval(() => {
      this.cityId = sessionStorage.getItem('FDC_CITY') || cityId
      if (this.cityId) {
        clearInterval(this.cityIdInterval)

        this.props.getProjectDetail(this.state.projectId, this.cityId)
        // 如果来自楼栋，需要知道楼栋的状态
        if (this.state.buildingId) {
          const params = {
            cityId: this.cityId,
            buildId: this.state.buildingId
          }
          this.props.getBuildDetail(params, () => {})
        }
      }
      this.props.getPhotoType() // 图片类型
      this.setState({
        imageButtonDis:!pagePermission('fdc:hd:residence:base:salePicture:change'),
        imageBuildButtonDis:!pagePermission('fdc:hd:residence:base:buildingPicture:change')
      })
    }, 100)
    if (cityId) {
      this.props.updateVisitCities({ cityId, cityName })
    }
  }

  handleConfirmDelete = () => {
    const that = this
    confirm({
      title: '您是否确定删除?',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        that.handleDelete()
      }
    })
  }

  handleDelete = () => {
    let ids = this.state.selectedRowKeys
    const TYPELIST = this.state.TYPELIST
    let dataImageList = this.state.dataImageList.records
    for(let i of ids){
      let item = dataImageList.find(e=>{
        return e.id===Number(i)
      })
      if(item){
        let index = TYPELIST.findIndex(e=>e===item.photoTypeCode)
        TYPELIST.splice(index,1)
      }
    }
    this.props.delProjectImages(ids.join(','), () => {
      Message.success('删除成功')
      const pagination = this.props.model.get('pagination')
      const qry = {
        pageNum: pagination.get('pagination'),
        pageSize: 20,
        projectId: this.state.projectId,
        buildingId: this.state.buildingId,
        cityId: this.cityId
      }
      this.props.getProjectImageList(qry,res=>{
        this.setState({
          dataImageList:res
        })
      })
      this.setState({ selectedRowKeys: [],TYPELIST })
    })
  }

  handlePageChange = pageNum => {
    const qry = {
      pageNum,
      pageSize: 20,
      projectId: this.state.projectId,
      buildingId: this.state.buildingId,
      cityId: this.cityId
    }
    this.props.getProjectImageList(qry,res=>{
        this.setState({
          dataImageList:res
        })
    })
  }

  handleShowImage = imageAddr => {
    this.setState({
      imageVisible: true,
      imageAddr
    })
  }

  handleCancelModal = e => {
    // e.stopPropagation()
    // // 阻止与原生事件的冒泡
    // e.nativeEvent.stopImmediatePropagation()
    this.setState({
      imageVisible: false,
      imageAddr: ''
    })
  }
  // S 编辑弹窗
  showModalEdit = tableData => {
    this.setState({
      editDate: tableData,
      visibleEdit: true
    })
  }

  handleOkEdit = () => {
    this.props.form.validateFields(
      ['photoName', 'photoTypeName'],
      (err, values) => {
        if (!err) {
          const { cityId, editDate } = this.state
          const photoParams = {
            cityId,
            id: editDate.id,
            photoName: values.photoName,
            photoTypeCode:
              values.photoTypeName === editDate.photoTypeName
                ? editDate.photoTypeCode
                : values.photoTypeName
          }

          this.props.editPhoto(photoParams, res => {
            const { code, message } = res || {}
            if (code === '200') {
              Message.success('编辑成功')
              this.handlePageChange(1)
              this.handleCancelEdit()
            } else {
              Message.error(message)
            }
          })
        }
      }
    )
  }

  handleCancelEdit = () => {
    this.props.form.resetFields(['photoName', 'photoTypeName'])
    this.setState({
      visibleEdit: false
    })
  }
  // E 编辑弹窗
  // S 新增弹窗
  addProjectPic = () => {
    this.setState({
      visibleAdd: true,
      MD5List:[],
      ADDLIST:[],
      TYPELIST:[],
      fileList:[]
    })
  }
  handleOkAdd = () => {
    const typeCode = this.props.form.getFieldValue('typeCode')
    if (typeCode === '' || !typeCode) {
      Message.error('请选择图片类型')
      return
    }
    const { buildingId, projectId, cityId, fileList } = this.state
    const parArr = []
    let params = {}
    if(fileList.length<1){
      Message.error('请上传图片')
      return
    }
    for (let i = 0; i < fileList.length; i += 1) {
      params = {
        buildingId: buildingId || 0,
        cityId: Number(cityId),
        photoName: fileList[i].name.split('.')[0] || '',
        photoPath: fileList[i].response.data || '',
        photoTypeCode: typeCode,
        projectId: projectId
      }
      parArr.push(params)
    }
    this.props.pictureSave(parArr, res => {
      if(res.code==='200'){
        const pagination = this.props.model.get('pagination')
        const qry = {
          pageNum:pagination.get('pagination'),
          pageSize: 20,
          projectId: this.state.projectId,
          buildingId: this.state.buildingId,
          cityId: this.cityId
        }
        this.props.getProjectImageList(qry,res=>{
          this.setState({
            dataImageList:res
          })
        })
        beforeUploadCounter = 0
        this.setState({
          visibleAdd: false,
          fileList: [],
          MD5List:[],
          ADDLIST:[],
          TYPELIST:[]
        })
      }else {
        Message.error(res.message)
      }
    })
  }
  handleCancelAdd = () => {
    beforeUploadCounter = 0
    this.props.form.resetFields(['typeCode'])
    this.setState({
      visibleAdd: false,
      MD5List:[],
      ADDLIST:[],
      TYPELIST:[],
      fileList:[]
    })
  }
  // E 新增弹窗
  // S 上传照片

  beforeUpload = file => {
    const isJPG = file.type === 'image/jpeg'
    const isJPEG = file.type === 'image/jpeg'
    const isBMP = file.type === 'image/bmp'
    const isPNG = file.type === 'image/png'
    const isGIF = file.type === 'image/gif'
    const isTIFF = file.type === 'image/tiff'
    const isLt2M = file.size / 1024 / 1024 < 5
    let fileList =this.state.fileList
    let dataImageList = this.state.dataImageList.records
    const e = this.props.form.getFieldValue('typeCode')
    return new Promise((resolve, reject) => {
      // if (e === '' || !e) {
      //   Message.error('请选择图片类型')
      //   reject(file)
      // }
      // 去除图片相同类型限制
      // let TYPELIST = []
      // for(let i of dataImageList){
      //   // TYPELIST
      //   TYPELIST.push(i.photoTypeCode)
      // }
      // for(let i of fileList){
      //   TYPELIST.push(i.photoTypeCode)
      // }
      // for(let i of TYPELIST){
      //   if(Number(e)===i){
      //     Message.error('该图片类型，不能存在相同图片。')
      //     reject(file)
      //     return
      //   }
      // }
      if (!(isJPG || isJPEG || isBMP || isPNG ||isGIF || isTIFF)) {
        Message.error(
          '上传失败，仅支持图片格式为JPG、BPM、PNG、GIF、TIFF，请重新上传'
        )
        reject(file)
        return
      } else if (!isLt2M) {
        Message.error(
          '上传失败，单张图片大小不能超过5M，请重新上传'
        )
        reject(file)
        return
      }
  
      continueUpload = true
      allFilesLength = beforeUploadCounter + fileList.length
      continueUpload = allFilesLength < 11
      //获取MD5文件验证码
      this.readAsArrayBuffer(file)
      .then(buffer => {
        var hash = md5(buffer)
        const MD5List = this.state.MD5List
        for(let i of MD5List){
          if(hash===i){
            Message.error('不能上传重复的图片，请重新选择')
            reject(file)
            return
          }
        }
        if (beforeUploadCounter >= 10) {
          Message.error('上传的文件不能超过10个，请重新选择')
          reject(file)
          return
        }
        beforeUploadCounter += 1
        const ADDLIST = this.state.ADDLIST
        const TYPELIST = this.state.TYPELIST
        ADDLIST.push(file.uid)
        TYPELIST.push(e)
        this.setState({ADDLIST,TYPELIST})
        MD5List.push(hash)
        this.setState({
          MD5List
        })
        file.photoTypeCode = Number(e)
        file.hash = hash
        resolve(file)
      })
    })
  }
  readAsArrayBuffer = file =>{
    return new Promise(function(resolve) {
      var reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onload = function(e) {
        resolve(e.target.result)
      }
    })
  }
  handleCancel = () => this.setState({ previewVisible: false })
  
  handleRemove = async file => {
    let MD5List = this.state.MD5List
    beforeUploadCounter--
    let index = this.state.MD5List.findIndex(e=>e===file.hash)
    MD5List.splice(index,1)
    this.setState({MD5List})
  }
  
  handlePreview = async file => {
    let imgIndex =  this.state.fileList.findIndex(e=>e.uid===file.uid) || 0
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }
    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      imgIndex:imgIndex
    })
  }
  handleChange = ({ fileList }) => {
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url
      }
      return file
    })
    const ADDLIST = this.state.ADDLIST
    for(let [idx,i] of fileList.entries()){
      if(i.status==='done'){
        let index = ADDLIST.findIndex(e=>e===i.uid)
        if(index===-1){
          fileList.splice(idx,1)
        }
      }
    }
    this.setState({ fileList} )
  }

  // E上传照片
  renderBreads() {
    const { projectDetail, buildDetail } = this.props.model
    const { projectName } = projectDetail
    const { buildingName } = buildDetail
    const { id, sysStatus } = projectDetail
    const { cityId, cityName } = this.state

    const breadList = [
      {
        key: 1,
        path: '',
        name: '住宅',
        icon: 'home'
      },
      {
        key: 2,
        path: router.RES_BASEINFO,
        name: '住宅基础数据'
      },
      {
        key: 3,
        path: router.RES_BASEINFO_ADD,
        name:
          projectName && projectName.length > 10
            ? `${projectName.substr(0, 10)}...`
            : projectName,
        search: `projectId=${id}&status=${sysStatus}&cityId=${cityId}&cityName=${cityName}`
      }
    ]

    if (this.state.buildingId) {
      breadList.push({
        key: 4,
        path: router.RES_BUILD_INFO_ADD,
        name:
          buildingName && buildingName.length > 10
            ? `${buildingName.substr(0, 10)}...`
            : buildingName,
        search: `projectId=${id}&buildId=${
          this.state.buildingId
        }&cityId=${cityId}&cityName=${cityName}`
      })
    }

    breadList.push({
      key: 5,
      path: '',
      name: '项目图片'
    })

    return (
      <Breadcrumb className={styles.breadContainer} separator=">">
        {breadList.map(item => (
          <Breadcrumb.Item key={item.key}>
            {item.icon ? <Icon type={item.icon} /> : ''}
            {item.path ? (
              <Link
                to={{
                  pathname: item.path,
                  search: item.search
                }}
              >
                {item.name}
              </Link>
            ) : (
              item.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }

  renderProjectInfo() {
    const { projectDetail } = this.props.model
    const { areaName = '', projectName, sysStatus = 1 } = projectDetail

    return (
      <div style={{ marginTop: 16 }}>
        <Alert
          style={{ minHeight: 40, paddingBottom: 0 }}
          message={
            <p>
              当前楼盘名称&nbsp;
              <span
                style={{
                  fontWeight: 600,
                  color: sysStatus === 1 ? '#33CABB' : '#FF0000'
                }}
              >
                {areaName} | {projectName}
              </span>
            </p>
          }
          type="info"
          showIcon
        />
      </div>
    )
  }

  render() {
    const { sysStatus:_sysStatus = 1 } = this.props.model.get('projectDetail')
    const { status:_status = 1 } = this.props.model.get('buildDetail')
    let _imgStatus = 1
    if (this.state.buildingId) {
      if (_sysStatus === 1) {
        // 如果楼盘是正式的,楼栋是删除的
        if (_status !== 1) {
          _imgStatus = 0
        }
      } else {
        _imgStatus = 0
      }
    } else {
      _imgStatus = _sysStatus
    }
    const columns = [
      {
        title: '图片名称',
        // dataIndex: 'photoName',
        width: 232,
        render: ({ photoName }) => (
          <Popover
            content={<div>{photoName}</div>}
            title={false}
            placement="topLeft"
          >
            <div className={styles.limitPhotoName}>{photoName}</div>
          </Popover>
        )
      },
      {
        title: '图片类型',
        width: 150,
        dataIndex: 'photoTypeName'
      },
      {
        title: '图片',
        width: 240,
        render: ({ photoPath }) => (
          <span
            onClick={() => this.handleShowImage(`/image${photoPath}`)}
            style={{ cursor: 'pointer' }}
          >
            <img src={`/image${photoPath}`} alt="" style={{ width: 60 }} />
          </span>
        )
      },
      {
        title: '操作',
        width: 150,
        render: record => (
          <div>
            {this.state.buildingId ? (
              <Fragment>
                <Button
                  type="primary"
                  onClick={() => this.showModalEdit(record)}
                  disabled={this.state.imageBuildButtonDis||!_imgStatus}
                >
                  编辑
                </Button>
              </Fragment>
            ) : (
              <Fragment>
                  <Button
                    type="primary"
                    onClick={() => this.showModalEdit(record)}
                    disabled={this.state.imageButtonDis||!_imgStatus}
                  >
                    编辑
                  </Button>
              </Fragment>
            )}
          </div>
        )
      }
    ]
    // S上传照片
    // eslint-disable-next-line
    const {
      buildingId,
      projectId,
      cityId,
      previewVisible,
      previewImage,
      fileList,
      imgIndex
      // photoTypePara
    } = this.state
    const { editDate } = this.state
    let initialName = ''
    if (editDate.photoName) {
      if (editDate.photoName.indexOf('】') < 0) {
        initialName = editDate.photoName
      } else {
        initialName = editDate.photoName.split('】')[1]
      }
    }
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传图片</div>
      </div>
    )
    // E上传照片
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: selectedRowKeys => {
        this.setState({
          selectedRowKeys
        })
      }
    }

    const { pageNum, pageSize, total } = this.props.model.get('pagination')
    const pagination = {
      current: pageNum,
      pageSize,
      total,
      showTotal,
      showQuickJumper: true,
      onChange: pageNum => {
        this.handlePageChange(pageNum)
      }
    }

    const { sysStatus = 1 } = this.props.model.get('projectDetail')
    const { status = 1 } = this.props.model.get('buildDetail')
    let imgStatus = 1
    if (this.state.buildingId) {
      if (sysStatus === 1) {
        // 如果楼盘是正式的,楼栋是删除的
        if (status !== 1) {
          imgStatus = 0
        }
      } else {
        imgStatus = 0
      }
    } else {
      imgStatus = sysStatus
    }
    // console.log(this.state.buildingId)
    const { getFieldDecorator } = this.props.form
    const { photoTypeList } = this.props.model
    // 上传图片
    const params = {
      buildingId,
      cityId,
      photoTypeCode: this.props.form.getFieldValue('typeCode') || '',
      projectId
    }
    return (
      <div>
        {this.renderBreads()}
        <div className={styles.container}>
          {/* 1.8需求新加新增按钮 */}
          
          {imgStatus ? (
            <Fragment>
              {(pagePermission('fdc:hd:residence:base:buildingPicture:add')&&this.state.buildingId)|| (pagePermission('fdc:hd:residence:base:salePicture:add')&&!this.state.buildingId)? (
                <Button
                  type="primary"
                  style={{ marginRight: 16 }}
                  onClick={this.addProjectPic}
                >
                  新增
                </Button>
              ) : (
                ''
              )}
            </Fragment>
          ):''}
          {imgStatus ? (
            <Fragment>
              {this.state.buildingId ? (
                <Fragment>
                  {pagePermission(
                    'fdc:hd:residence:base:buildingPicture:delete'
                  ) ? (
                    <Button
                      type="danger"
                      style={{ marginRight: 16 }}
                      disabled={!this.state.selectedRowKeys.length}
                      onClick={this.handleConfirmDelete}
                    >
                      删除
                    </Button>
                  ) : (
                    ''
                  )}
                </Fragment>
              ) : (
                <Fragment>
                  {pagePermission(
                    'fdc:hd:residence:base:salePicture:delete'
                  ) ? (
                    <Button
                      type="danger"
                      style={{ marginRight: 16 }}
                      disabled={!this.state.selectedRowKeys.length}
                      onClick={this.handleConfirmDelete}
                    >
                      删除
                    </Button>
                  ) : (
                    ''
                  )}
                </Fragment>
              )}
            </Fragment>
          ) : null}

          {this.renderProjectInfo()}
          <Table
            columns={columns}
            dataSource={this.props.projectImageList}
            style={{ marginTop: 16 }}
            rowSelection={rowSelection}
            pagination={pagination}
            loading={this.context.loading.includes(
              actions.GET_PROJECT_IMAGE_LIST
            )}
            scroll={{ y: 420 }}
            className={styles.defineTable}
          />
          {/*<Modal*/}
          {/*  visible={this.state.imageVisible}*/}
          {/*  footer={null}*/}
          {/*  onCancel={this.handleCancelModal}*/}
          {/*>*/}
          {/*  <img*/}
          {/*    alt="showImg"*/}
          {/*    style={{ width: '100%' }}*/}
          {/*    src={this.state.imageAddr}*/}
          {/*  />*/}
          {/*</Modal>*/}
  
          <ImgPreview
            isList={false}
            visible={this.state.imageVisible}  // 是否可见
            onClose={this.handleCancelModal} // 关闭事件
            src={this.state.imageAddr} // 图片url
            picKey={this.state.imageAddr} // 下载需要的key，根据自己需要决定
            isAlwaysCenterZoom={true} // 是否总是中心缩放，默认false，若为true，每次缩放图片都先将图片重置回屏幕中间
            isAlwaysShowRatioTips={false} // 是否总提示缩放倍数信息，默认false，只在点击按钮时提示，若为true，每次缩放图片都会提示
          />
          {/* S编辑按钮弹窗 */}
          <Modal
            title="编辑图片"
            visible={this.state.visibleEdit}
            onOk={this.handleOkEdit}
            onCancel={this.handleCancelEdit}
            maskClosable={false}
          >
            <Form>
              <FormItem
                label="图片名称"
                labelCol={layout(6, 6)}
                wrapperCol={layout(18, 16)}
              >
                {getFieldDecorator('photoName', {
                  initialValue: initialName
                })(<Input placeholder="请输入图片名称" maxLength={100} />)}
              </FormItem>
              <FormItem
                label="图片类型"
                labelCol={layout(6, 6)}
                wrapperCol={layout(18, 16)}
              >
                {getFieldDecorator('photoTypeName', {
                  rules: [
                    {
                      required: true,
                      message: '请选择图片类型'
                    }
                  ],
                  initialValue: editDate.photoTypeName
                })(
                  <Select placeholder="请选择图片类型" allowClear>
                    {photoTypeList.map(item => (
                      <Option value={item.get('code')} key={item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Form>
          </Modal>
          {/* E编辑按钮弹窗 */}
          {/* S新增按钮弹窗 */}
          <Modal
            title="新增图片"
            visible={this.state.visibleAdd}
            onOk={this.handleOkAdd}
            onCancel={this.handleCancelAdd}
            // destroyOnClose={true}
            okText={'保存'}
            maskClosable={false}
            className={styles.addModel}
          >
            <Form>
              <FormItem
                label="图片类型"
                labelCol={layout(6, 4)}
                wrapperCol={layout(18, 16)}
              >
                {getFieldDecorator('typeCode', {
                  rules: [
                    {
                      required: true,
                      message: '请选择图片类型'
                    }
                  ]
                })(
                  <Select placeholder="请选择图片类型" allowClear>
                    {photoTypeList.map(item => (
                      <Option value={item.get('code')} key={item.get('code')}>
                        {item.get('name')}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
              {/* S上传照片 */}
              <div className="clearfix">
                <Upload
                  action="/fdc/pictures/upload"
                  listType="picture-card"
                  multiple={true} // eslint-disable-line
                  fileList={fileList}
                  data={params}
                  onPreview={this.handlePreview}
                  onChange={this.handleChange}
                  beforeUpload={this.beforeUpload}
                  onRemove={this.handleRemove}
                >
                  {fileList.length >= 10 ? null : uploadButton}
                </Upload>
                {/*<Modal*/}
                {/*  visible={previewVisible}*/}
                {/*  footer={null}*/}
                {/*  onCancel={this.handleCancel}*/}
                {/*>*/}
                  {/*<img*/}
                  {/*  alt="example"*/}
                  {/*  style={{ width: '100%' }}*/}
                  {/*  src={previewImage}*/}
                  {/*/>*/}
                {/*</Modal>*/}
                <ImgPreviewList
                  imgIndex={imgIndex}
                  isList={true}
                  visible={previewVisible}  // 是否可见
                  onClose={this.handleCancel} // 关闭事件
                  src={fileList.length >= 1 ? fileList[imgIndex].thumbUrl : []}
                  picKey={fileList.length >= 1 ? fileList[imgIndex].thumbUrl : []}
                  images={fileList}
                  isAlwaysCenterZoom={true} // 是否总是中心缩放，默认false，若为true，每次缩放图片都先将图片重置回屏幕中间
                  isAlwaysShowRatioTips={false} // 是否总提示缩放倍数信息，默认false，只在点击按钮时提示，若为true，每次缩放图片都会提示
                />
              </div>
              {/* E上传照片 */}
            </Form>
          </Modal>
          {/* E新增按钮弹窗 */}
        </div>
      </div>
    )
  }
}

export default compose(
  Form.create(),
  connect(
    modelSelector,
    containerActions
  )
)(ProImage)
