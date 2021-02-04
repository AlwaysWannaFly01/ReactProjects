import isNode from 'detect-node'

export function is(object, type) {
  return Object.prototype.toString.call(object) === `[object ${type}]`
}

/**
 * getSearchQuery - 对传入的查询字段进行处理, 去除掉非必要字段。
 *
 * @param  {type} query: object = {} description
 * @return {type}                    description
 */
function getSearchQuery(query = {}) {
  Object.keys(query).forEach(item => {
    if (typeof query[item] === 'object') {
      getSearchQuery(query[item])
    } else if (query[item] === '' || query[item] === undefined) {
      delete query[item]
    } else {
      let str = `${query[item]}`
      str = str.replace(/^\s+|\s+$/g, '')
      query[item] = str
    }
  })
  return query
}

export function makeApiQueryString(criteria, others) {
  const query = {
    criteria,
    ...others
  }
  getSearchQuery(query)
  return `?filter=${encodeURI(JSON.stringify(query))}`
}

export function createPagination({
  total,
  pageNum,
  pageSize,
  callback = function noop() {}
}) {
  return {
    total,
    pageSize,
    current: pageNum,
    showTotal: (total, range) =>
      `共${total}条记录，当前显示第${range[0]}-${range[1]}条记录`,
    showQuickJumper: true,
    showSizeChanger: true,
    onChange: (pageNum, pageSize) => callback(null, pageNum, pageSize),
    onShowSizeChange: (pageNum, pageSize) => callback(null, pageNum, pageSize)
  }
}

// 获取查询参数，仅在constructor调用
export function parseSearchString(search, others) {
  let query = {}
  try {
    query = JSON.parse(decodeURI(search.substr(1)).replace('filter=', ''))
  } catch (e) {
    //
  }
  // qs.parse出异常或者没有参数，则使用默认参数
  if (!Object.keys(query).length) {
    search = makeApiQueryString({}, others)
  }
  if (is(query.criteria, 'Object')) {
    query = query.criteria
  } else {
    query = {}
  }
  return {
    search,
    query
  }
}

// 判断是否有对应权限
export function pagePermission(name) {
  let hasPermiss = false
  // let resourceName
  if (!isNode) {
    let resourceCodeList = localStorage.getItem('menuAuth')
    if (resourceCodeList) {
      resourceCodeList = JSON.parse(resourceCodeList)
      const index = resourceCodeList.findIndex(
        item => item.resourceCode === name
      )
      if (index > -1) {
        hasPermiss = true
        // resourceName = resourceCodeList[index].resourceName
      }
    }
  }
  // return { hasPermiss, resourceName }
  return hasPermiss
}
