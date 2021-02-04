/* eslint react/prop-types: 0, react/no-danger: 0 */
import React from 'react'
import './IconFont.less'

export default ({ type, style = {} }) => {
  const html = `<use xlink:href="#icon-${type}" />`
  return (
    <svg style={style} className="iconfont anticon" dangerouslySetInnerHTML={{ __html: html }} />
  )
}
