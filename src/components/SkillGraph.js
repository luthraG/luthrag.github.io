import React, { Component } from 'react';
import Highcharts from 'highcharts';

const COLORS = Highcharts.getOptions().colors;

class SkillGraph extends Component {
  constructor(props) {
    super(props);
  
    this.categories = [
      'Back-end',
      'Database',
      'Data Science',
      'Data Visualization',
      'Front-end'
    ];
  
    this.data = [
      {
        y: 52.7,
        color: COLORS[3],
        drilldown: {
          name: 'Back-end',
          categories: [
            'ExpressJs',
            'GraphQL',
            'NodeJs',
            'Python'
          ],
          data: [
            7.5,
            5.6,
            24.7,
            14.9
          ]
        }
      },
      {
        y: 19.1,
        color: COLORS[8],
        drilldown: {
          name: 'Database',
          categories: [
            'Elasticsearch',
            'MongoDB',
            'PostgresSQL',
            'Redis'
          ],
          data: [
            9.7,
            5.4,
            1.7,
            2.3
          ]
        }
      },
      {
        y: 14.3,
        color: COLORS[6],
        drilldown: {
          name: 'Data Science',
          categories: [
            'NLP',
            'Python'
          ],
          data: [
            7.1,
            7.2
          ]
        }
      },
      {
        y: 7.7,
        color: COLORS[7],
        drilldown: {
          name: 'Data Visualization',
          categories: [
            'D3.js',
            'Highcharts',
            'Recharts'
          ],
          data: [
            2.5,
            3.6,
            1.6
          ]
        }
      },
      {
        y: 6.2,
        color: COLORS[1],
        drilldown: {
          name: 'Front-end',
          categories: [
            'ReactJS',
            'CSS3',
            'HTML5'
          ],
          data: [
            2.9,
            1.7,
            1.6
          ]
        }
      }
    ];
  }

  skillChartRender() {
    let techCategoryData = [];
    let focusData = [];

    // Build the data arrays
    for (let i = 0; i < this.data.length; i += 1) {
        // add browser data
        techCategoryData.push({
            name: this.categories[i],
            y: this.data[i].y,
            color: this.data[i].color
        });

        // add version data
        let drillDataLen = this.data[i].drilldown.data.length;
        for (let j = 0; j < drillDataLen; j += 1) {
            let brightness = 0.2 - (j / drillDataLen) / 5;
            focusData.push({
                name: this.data[i].drilldown.categories[j],
                y: this.data[i].drilldown.data[j],
                color: Highcharts.Color(this.data[i].color).brighten(brightness).get()
            });
        }
    }

    // Create the chart
    Highcharts.chart({
      chart: {
          type: 'pie',
          renderTo: 'skill-graph',
          backgroundColor: 'rgba(255, 255, 255, 0.0)'
      },
      credits: {
        enabled: false
      },
      title: {
          text: ''
      },
      subtitle: {
          text: ''
      },
      plotOptions: {
          pie: {
              shadow: false,
              center: ['50%', '50%']
          }
      },
      tooltip: {
          valueSuffix: '%'
      },
      series: [{
          name: 'Skills',
          data: techCategoryData,
          size: '60%',
          dataLabels: {
              formatter: function () {
                  return this.y > 5 ? this.point.name : null;
              },
              color: '#FFF',
              distance: -60,
              style: {
                opacity: 1,
                textOutline: ""
              }
          }
      }, {
          name: 'Focus',
          data: focusData,
          size: '80%',
          innerSize: '60%',
          dataLabels: {
              formatter: function () {
                  // display only if larger than 1
                  return this.y > 1 ? '<b>' + this.point.name + ':</b> ' +
                      this.y + '%' : null;
              },
              color: '#083741',
              style: {
                opacity: 1,
                textOutline: ""
              }
          },
          id: 'versions'
      }],
      responsive: {
          rules: [{
              condition: {
                  maxWidth: 400
              },
              chartOptions: {
                  series: [{
                  }, {
                      id: 'versions',
                      dataLabels: {
                          enabled: false
                      }
                  }]
              }
          }]
      }
    });
  }

  componentDidMount() {
    this.skillChartRender();
  }

  render() {
    // Finally, render it!
    return (
        <div id="skill-graph">
        </div>
    );
  }
}

export default SkillGraph;
