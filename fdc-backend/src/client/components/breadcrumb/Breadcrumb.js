import React from 'react'
import { breadcrumbMap } from 'client/router/config'
import { Breadcrumb } from 'antd'

const extraBreadMap = {
  '/property/res/pro-info': '楼盘信息',
  '/property/res/build-info': '楼栋信息',
  '/property/res/pro-image': '项目图片',
  '/property/res/house-stand': '系数差',
  '/property/res/house-num': '房号列表'
}

// eslint-disable-next-line
function BreadcrumbNav({ pathname }) {
  const pathSnippets = pathname.split('/').filter(i => i)
  const allBreadcrumbMap = Object.assign({}, breadcrumbMap, extraBreadMap)
  return (
    <Breadcrumb>
      {pathSnippets.map((_, index) => {
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
        return (
          <Breadcrumb.Item key={url}>
            <a>{allBreadcrumbMap[url]}</a>
          </Breadcrumb.Item>
        )
      })}
    </Breadcrumb>
  )
}

export default BreadcrumbNav
