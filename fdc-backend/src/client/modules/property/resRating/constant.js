import React from 'react'
import router from 'client/router'
import { Popover } from 'antd'
import moment from 'moment'
import styles from './ResRating.less'

export const breadList = [
  {
    key: 1,
    path: '',
    name: '住宅',
    icon: 'home'
  },
  {
    key: 2,
    name: '住宅基础数据',
    path: router.RES_BASEINFO
  },
  {
    key: 3,
    path: '',
    name: '楼盘评级结果',
    icon: ''
  }
]

// 楼盘评级列表
export const columns = [
  {
    title: '行政区',
    width: 114,
    dataIndex: 'areaName',
    fixed: 'left',
    render: areaName => (
      <Popover content={<div style={{ maxWidth: '200px' }}>{areaName}</div>}>
        <div className={styles.limitAreaName}>{areaName || '——'}</div>
      </Popover>
    )
  },
  {
    title: '楼盘名称',
    width: 215,
    dataIndex: 'projectName',
    fixed: 'left',
    render: (projectName, { sysStatus }) => (
      <Popover
        content={<div style={{ maxWidth: '200px' }}>{projectName}</div>}
        title={false}
        placement="topLeft"
      >
        <div className={styles.limitProjectName}>
          <span className={sysStatus ? null : `${styles.delProject}`}>
            {projectName}
          </span>
        </div>
      </Popover>
    )
  },
  {
    title: '月份',
    width: 151,
    dataIndex: 'useMonth',
    fixed: 'left',
    render: useMonth => {
      const v = useMonth ? moment(useMonth).format('YYYY-MM') : ''
      return v
    }
  },
  
  
  // {
  //   title: '环线位置',
  //   width: 114,
  //   dataIndex: 'loopLineName',
  //   render: loopLineName => <span>{loopLineName || '——'}</span>
  // },
  // {
  //   title: '价格',
  //   width: 96,
  //   dataIndex: 'projectPrice',
  //   render: projectPrice => <span>{projectPrice || '——'}</span>
  // },
  // {
  //   title: '竣工日期',
  //   width: 151,
  //   dataIndex: 'deliveryDate',
  //   render: deliveryDate => {
  //     return  deliveryDate ? moment(deliveryDate).format('YYYY-MM-DD') : '——'
  //   }
  // },
  // {
  //   title: '区位得分',
  //   width: 96,
  //   dataIndex: 'locationScore',
  //   render: locationScore => <span>{locationScore || '——'}</span>
  // },
  // {
  //   title: '价格得分',
  //   width: 96,
  //   dataIndex: 'priceScore',
  //   render: priceScore => <span>{priceScore || '——'}</span>
  // },
  {
    title: '报盘活跃度得分',
    width: 190,
    dataIndex: 'offerLivenessScore',
    render: offerLivenessScore => <span>{offerLivenessScore||offerLivenessScore===0?offerLivenessScore: '——'}</span>
  },
  {
    title: 'VQ查询热度得分',
    width: 190,
    dataIndex: 'vqQueryScore',
    render: vqQueryScore => <span>{vqQueryScore||vqQueryScore===0?vqQueryScore: '——'}</span>
  },
  {
    title: '竣工日期得分',
    width: 190,
    dataIndex: 'deliveryDateScore',
    render: deliveryDateScore => <span>{deliveryDateScore||deliveryDateScore===0?deliveryDateScore: '——'}</span>
  },
  {
    title: '开发商得分',
    width: 142,
    dataIndex: 'developerScore',
    render: developerScore => <span>{developerScore||developerScore===0?developerScore: '——'}</span>
  },
  {
    title: '楼盘体量得分',
    width: 190,
    dataIndex: 'volumeScore',
    render: volumeScore => <span>{volumeScore ||volumeScore===0?volumeScore: '——'}</span>
  },
  {
    title: '内部配套得分',
    width: 190,
    dataIndex: 'facilitiesScore',
    render: facilitiesScore => <span>{facilitiesScore ||facilitiesScore===0?facilitiesScore: '——'}</span>
  },
  {
    title: '物业得分',
    width: 142,
    dataIndex: 'managementScore',
    render: managementScore => <span>{managementScore || managementScore===0?managementScore:'——'}</span>
  },
  {
    title: '交通得分',
    width: 142,
    dataIndex: 'transportationScore',
    render: transportationScore => <span>{transportationScore ||transportationScore===0?transportationScore: '——'}</span>
  },
  {
    title: '市政得分',
    width: 142,
    dataIndex: 'municipalityScore',
    render: municipalityScore => <span>{municipalityScore || municipalityScore===0?municipalityScore:'——'}</span>
  },
  {
    title: '医疗得分',
    width: 142,
    dataIndex: 'medicalScore',
    render: medicalScore => <span>{medicalScore || medicalScore===0?medicalScore:'——'}</span>
  },
  {
    title: '教育得分',
    width: 142,
    dataIndex: 'educationScore',
    render: educationScore => <span>{educationScore || educationScore===0?educationScore:'——'}</span>
  },
  {
    title: '商业得分',
    width: 142,
    dataIndex: 'commercialScore',
    render: commercialScore => <span>{commercialScore || commercialScore===0?commercialScore:'——'}</span>
  },
  // {
  //   title: '入围银行白名单得分',
  //   width: 250,
  //   dataIndex: 'bankWhitelistScore',
  //   render: bankWhitelistScore => <span>{bankWhitelistScore || bankWhitelistScore===0?bankWhitelistScore:'——'}</span>
  // },
  {
    title: '租售比',
    width: 142,
    dataIndex: 'priceRentRatioScore',
    render: commercialScore => <span>{commercialScore || commercialScore===0?commercialScore:'——'}</span>
  },
  {
    title: '价格稳定性',
    width: 142,
    dataIndex: 'priceStabilityScore',
    render: commercialScore => <span>{commercialScore || commercialScore===0?commercialScore:'——'}</span>
  },
  // {
  //   title: '平均成交周期(天)',
  //   width: 210,
  //   dataIndex: 'avgDealPeriod',
  //   render: avgDealPeriod => <span>{avgDealPeriod || avgDealPeriod===0?avgDealPeriod:'——'}</span>
  // },
  // {
  //   title: '平均议价空间(%)',
  //   width: 200,
  //   dataIndex: 'avgBargainSpace',
  //   render: avgBargainSpace => <span>{avgBargainSpace || avgBargainSpace===0?avgBargainSpace:'——'}</span>
  // },
  {
    title: '楼盘评级排位占比(%)',
    width: 200,
    dataIndex: 'rankRate',
    render: rankRate => <span>{rankRate || rankRate===0?rankRate:'——'}</span>
  },
  {
    title: '总得分',
    width: 96,
    dataIndex: 'totalScore',
    fixed: 'right',
    render: totalScore => <span>{totalScore ||totalScore===0?totalScore: '——'}</span>
  },
  {
    title: '楼盘等级',
    width: 96,
    dataIndex: 'grade',
    fixed: 'right',
    render: grade => <span>{grade || '——'}</span>
  },
]

export const timeExplain = (
  <div>
    <span>1）区间左右的值，统一为“包含”；</span>
    <span>
      2）只填左边，来表示区间是 [a，＋∞）；只填右边，来表示区间是（－∞，a]。
    </span>
  </div>
)
