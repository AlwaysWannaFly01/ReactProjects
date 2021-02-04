import isNode from 'detect-node'
/*
*  梳理MenuListAuth的数据结构
*  将N层嵌套改造成深度为1的Array
*/
const menuListArr1 = []
const handleMenusData = menus => {
  menus.forEach(item => {
    if (item.children && item.children.length) {
      const newItem = Object.assign({}, item)
      delete newItem.children
      menuListArr1.push(newItem)
      handleMenusData(item.children)
    } else {
      menuListArr1.push(item)
    }
  })
}

/*
*  根据用户中心权限JSON
*  可以将权限分类 resourceType: 1.Menu 2.List 3.Button
*/
export default function getAuths(resourceType) {
  if (!isNode) {
    const newMenuList = []
    // 获取菜单权限
    let menuList = localStorage.getItem('FDC_MENU_AUTH')
    if (menuList) {
      menuList = JSON.parse(menuList)
      handleMenusData(menuList)
    }

    switch (resourceType) {
      case 'Menu':
        menuListArr1.forEach(item => {
          if (item.resourceType === 'Menu') {
            newMenuList.push(item)
          }
        })
        break
      case 'List':
        menuListArr1.forEach(item => {
          if (item.resourceType === 'List') {
            newMenuList.push(item)
          }
        })
        break
      case 'Button':
        menuListArr1.forEach(item => {
          if (item.resourceType === 'Button') {
            newMenuList.push(item)
          }
        })
        break
      default:
        break
    }
    return newMenuList
  }
  return []
}
