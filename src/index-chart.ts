// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core'
// Import bar charts, all suffixed with Chart
import { BarChart, RadarChart, HeatmapChart } from 'echarts/charts'
// Import the tooltip, title, rectangular coordinate system, dataset and transform components
// all suffixed with Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  VisualMapComponent,
  LegendComponent
} from 'echarts/components'
// Features like Universal Transition and Label Layout
import { LabelLayout, UniversalTransition } from 'echarts/features'
// Import the Canvas renderer
// Note that introducing the CanvasRenderer or SVGRenderer is a required step
import { CanvasRenderer } from 'echarts/renderers'

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  RadarChart,
  HeatmapChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  VisualMapComponent,
  LegendComponent
])

// https://echarts.apache.org/examples/en/editor.html?c=radar&lang=ts
const chart1Ele = document.getElementById('chart1')
if (chart1Ele === null) {
  throw new Error('#chart1 element dont exist.')
}
const chart1 = echarts.init(chart1Ele, 'dark')
const option1 = {
  backgroundColor: 'rgba(255,255,255,0)',
  radar: {
    radius: '55%',
    indicator: [
      { name: 'Price', max: 100 },
      { name: 'CPU', max: 100 },
      { name: 'Memory', max: 100 },
      { name: 'RAM', max: 100 },
      { name: 'GPU', max: 100 },
      { name: 'Power', max: 100 }
    ]
  },
  series: [
    {
      type: 'radar',
      symbolSize: 2,
      data: [
        {
          value: [100, 20, 30, 50, 20, 10]
        }
      ],
      itemStyle: {
        color: '#57cf48'
      },
      areaStyle: {
        opacity: 0.6
      }
    }
  ]
}
chart1.setOption(option1)

// https://echarts.apache.org/examples/en/editor.html?c=bar-stack&lang=ts
const option2 = {
  backgroundColor: 'rgba(255,255,255,0)',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {},
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '80',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Direct',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      data: [320, 332, 301, 334, 390, 330, 320]
    },
    {
      name: 'Email',
      type: 'bar',
      stack: 'Ad',
      emphasis: {
        focus: 'series'
      },
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: 'Union Ads',
      type: 'bar',
      stack: 'Ad',
      emphasis: {
        focus: 'series'
      },
      data: [220, 182, 191, 234, 290, 330, 310]
    },
    {
      name: 'Video Ads',
      type: 'bar',
      stack: 'Ad',
      emphasis: {
        focus: 'series'
      },
      data: [150, 232, 201, 154, 190, 330, 410]
    },
    {
      name: 'Search Engine',
      type: 'bar',
      data: [862, 1018, 964, 1026, 1679, 1600, 1570],
      emphasis: {
        focus: 'series'
      },
      markLine: {
        lineStyle: {
          type: 'dashed'
        },
        data: [[{ type: 'min' }, { type: 'max' }]]
      }
    },
    {
      name: 'Baidu',
      type: 'bar',
      barWidth: 5,
      stack: 'Search Engine',
      emphasis: {
        focus: 'series'
      },
      data: [620, 732, 701, 734, 1090, 1130, 1120]
    },
    {
      name: 'Google',
      type: 'bar',
      stack: 'Search Engine',
      emphasis: {
        focus: 'series'
      },
      data: [120, 132, 101, 134, 290, 230, 220]
    },
    {
      name: 'Bing',
      type: 'bar',
      stack: 'Search Engine',
      emphasis: {
        focus: 'series'
      },
      data: [60, 72, 71, 74, 190, 130, 110]
    },
    {
      name: 'Others',
      type: 'bar',
      stack: 'Search Engine',
      emphasis: {
        focus: 'series'
      },
      data: [62, 82, 91, 84, 109, 110, 120]
    }
  ]
}
const chart2Ele = document.getElementById('chart2')
if (chart2Ele === null) {
  throw new Error('#chart2 element dont exist.')
}
const chart2 = echarts.init(chart2Ele, 'dark')
chart2.setOption(option2)

// https://echarts.apache.org/examples/en/editor.html?c=heatmap-cartesian&lang=ts
const hours = [
  '12a', '1a', '2a', '3a', '4a', '5a', '6a',
  '7a', '8a', '9a', '10a', '11a',
  '12p', '1p', '2p', '3p', '4p', '5p',
  '6p', '7p', '8p', '9p', '10p', '11p'
]

const days = [
  'Saturday', 'Friday', 'Thursday',
  'Wednesday', 'Tuesday', 'Monday', 'Sunday'
]

const data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]]
  .map(function (item) {
    let last: number | string = '-'
    if (item[2] !== null) {
      last = item[2]
    }
    return [item[1], item[0], last]
  })

const option3 = {
  backgroundColor: 'rgba(255,255,255,0)',
  tooltip: {
    position: 'top'
  },
  grid: {
    height: '50%',
    top: '10%',
    left: '80'
  },
  xAxis: {
    type: 'category',
    data: hours,
    splitArea: {
      show: true
    }
  },
  yAxis: {
    type: 'category',
    data: days,
    splitArea: {
      show: true
    }
  },
  visualMap: {
    min: 0,
    max: 10,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '15%'
  },
  series: [
    {
      name: 'Punch Card',
      type: 'heatmap',
      data: data,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}
const chart3Ele = document.getElementById('chart3')
if (chart3Ele === null) {
  throw new Error('#chart3 element dont exist.')
}
const chart3 = echarts.init(chart3Ele, 'dark')
chart3.setOption(option3)

export function updateChart1 (): void {
  option1.series[0].data[0].value.forEach((value, index) => {
    option1.series[0].data[0].value[index] = 20 + 80 * Number(Math.random().toFixed(2))
  })
  chart1.setOption(option1)
}

export function updateChart2 (): void {
  chart2.setOption(option2)
  chart2.resize()
}

export function updateChart3 (): void {
  chart3.setOption(option3)
  chart3.resize()
}
