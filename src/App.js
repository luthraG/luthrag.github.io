import React, { Component } from 'react';
import SkillGraph from './components/SkillGraph';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn, faGithub, faNpm } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './styles/App.css';
import profile from './images/profiler.jpeg';
import zippia from './images/zippia.png';
import npm from './images/npm64.png';
import adobe from './images/adobe.png';
import newgen from './images/newgen.png';
import motofix from './images/motofix.jpeg';
import digitalguardian from './images/digitalguardian.png';

class App extends Component {
  constructor() {
    super();

    this.state = {

    }
  }

  render() {
    return (
      <div className="App">
        <div className="white-container">
        <img src={profile} className="profile-pic" alt="Gaurav Luthra" />
          <h1>Gaurav Luthra</h1>
          <h3>Software Architect</h3>
          <h5>Computer Scientist</h5>
        </div>
        <section id="about" className="mast mast-teal">
          <div className="colored-container">
            <h3 className="h2">
              About Gaurav
            </h3>
            <p className="text-xxl">Having keen interest in Mathematics from my childhood, I inclinced towards computer programming at very young age. I was born in Bhiwani, India and got my Bachelor's degree from there as well.</p>
            <p className="text-xxl">During my Bachelor's in Computer Science, I published many research papers on computer security. I have invented the technology for video synchronization based on audio cue and patented that technology. I am also strong believer of open source and published many open source modules which have more than 150K downloads.</p>
            < p className="text-xxl">I wonder what's next...</p>
            <hr className="separator" />
          </div>
        </section>
        <section id="techstack" className="mast mast-zeal">
          <div className="colored-container">
            <h3 className="h2">
                Technology I Use
            </h3>
            <div className="colored-container">
              <div className="logo-row justify-content-md-center">
                <div className="col-lg-p col-6">
                  <div className="service-box" title="NodeJS">
                    <i className="devicon-nodejs-plain colored"></i>
                  </div>
                  NodeJS
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="Python">
                    <i className="devicon-python-plain colored"></i>
                  </div>
                  Python
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="ExpressJS">
                    <i className="devicon-express-original colored"></i>
                  </div>
                  ExpressJS
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="ReactJS">
                    <i className="devicon-react-original colored"></i>
                  </div>
                  ReactJS
                </div>
              </div>
              <div className="logo-row justify-content-md-center">
                <div className="col-lg-p col-6">
                  <div className="service-box" title="JS">
                    <i className="devicon-javascript-plain colored"></i>
                  </div>
                  JavaScript
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="Typescript">
                    <i className="devicon-typescript-plain colored"></i>
                  </div>
                  Typescript
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="Babel">
                    <i className="devicon-babel-plain colored"></i>
                  </div>
                  Babel
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="Mocha">
                    <i className="devicon-mocha-plain colored"></i>
                  </div>
                  Mocha
                </div>
              </div>
              <div className="logo-row justify-content-md-center">
                <div className="col-lg-p col-6">
                  <div className="service-box" title="d3js">
                    <i className="devicon-d3js-plain colored"></i>
                  </div>
                  d3js
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="CSS">
                    <i className="devicon-css3-plain colored"></i>
                  </div>
                  CSS3
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="HTML">
                    <i className="devicon-html5-plain colored"></i>
                  </div>
                  HTML5
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="Cucumber">
                    <i className="devicon-cucumber-plain colored"></i>
                  </div>
                  Cucumber
                </div>
              </div>
              <div className="logo-row justify-content-md-center">
                <div className="col-lg-p col-6">
                  <div className="service-box" title="git">
                    <i className="devicon-git-plain colored"></i>
                  </div>
                  Git
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="AWS">
                    <i className="devicon-amazonwebservices-original colored"></i>
                  </div>
                  AWS
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="nginx">
                    <i className="devicon-nginx-original colored"></i>
                  </div>
                  nginx
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="Heroku">
                    <i className="devicon-heroku-original colored"></i>
                  </div>
                  Heroku
                </div>
              </div>
              <div className="logo-row justify-content-md-center">
                <div className="col-lg-p col-6">
                  <div className="service-box" title="mongoDB">
                    <i className="devicon-mongodb-plain colored"></i>
                  </div>
                  MongoDB
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="PostgreSql">
                    <i className="devicon-postgresql-plain colored"></i>
                  </div>
                  PostgreSql
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="MySQL">
                    <i className="devicon-mysql-plain colored"></i>
                  </div>
                  MySQl
                </div>
                <div className="col-lg-p col-6">
                  <div className="service-box" title="Redis">
                    <i className="devicon-redis-plain colored"></i>
                  </div>
                  Redis
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="skills" className="mast mast-teal">
          <div className="colored-container">
            <h3 className="h2">
              Skills
            </h3>
            <p className="text-xxl">
              Jack of various programming languages and master of solving problems. I believe in solving the problems that matters. My passion lies in designing the solutions that can scale well with exponential growth.
            </p>
            <div className="well text-xl push-top">
              A programming language should be choosen based on problem under consideration.
            </div>
            <div className="row text-left">
              <div className="col-sm-8 hidden-xs">
                <h4 className="page-header">Skill Distribution</h4>
                <SkillGraph />
              </div>
              <div className="col-sm-4">
                <h4 className="page-header">Focus Area</h4>
                <div className="list-group list-group-striped push-top">
                  <div className="list-group-item">
                    <div className="text-medium">NodeJS</div>
                    <div className="progress progress-success">
                      <div className="progress-bar progress-bar-success" style={{"width" : "90%"}}>
									    </div>
									  </div>
                  </div>
                  <div className="list-group-item">
                    <div className="text-medium">Elasticsearch</div>
                    <div className="progress progress-success">
                      <div className="progress-bar progress-bar-success" style={{"width" : "85%"}}>
									    </div>
									  </div>
                  </div>
                  <div className="list-group-item">
                    <div className="text-medium">Data Structures</div>
                    <div className="progress progress-info-light">
                      <div className="progress-bar progress-bar-info-light" style={{"width" : "78%"}}>
									    </div>
									  </div>
                  </div>
                  <div className="list-group-item">
                    <div className="text-medium">Algorithms</div>
                    <div className="progress progress-info-light">
                      <div className="progress-bar progress-bar-info-light" style={{"width" : "82%"}}>
									    </div>
									  </div>
                  </div>
                  <div className="list-group-item">
                    <div className="text-medium">ReactJS</div>
                    <div className="progress progress-warning">
                      <div className="progress-bar progress-bar-warning" style={{"width" : "60%"}}>
									    </div>
									  </div>
                  </div>
                  <div className="list-group-item">
                    <div className="text-medium">Python</div>
                    <div className="progress progress-warning">
                      <div className="progress-bar progress-bar-warning" style={{"width" : "72%"}}>
									    </div>
									  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="research" className="mast mast-zeal">
          <div className="colored-container">
            <h3 className="h2">
                Open Source
            </h3>
            <div className="row text-left">
              <div className="col-sm-8 hidden-xs">
                <h4 className="page-header">NPM Modules</h4>
                <div className="os-header">
                  <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/package/node-ratify"><h3 className="fw6 f4 black-90 dib lh-solid ma0 no-underline hover-black">node-ratify</h3></a>
                  <p style={{"marginTop":"1%"}}>A validation library for String, Number, Date & Objects</p>
                </div>
                <div className="os-header">
                  <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/package/image-watermark"><h3 className="fw6 f4 black-90 dib lh-solid ma0 no-underline hover-black">image-watermark</h3></a>
                  <p style={{"marginTop":"1%"}}>A powerful watermark library for images and PDFs</p>
                </div>
                <div className="os-header">
                  <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/package/csv-headers"><h3 className="fw6 f4 black-90 dib lh-solid ma0 no-underline hover-black">csv-headers</h3></a>
                  <p style={{"marginTop":"1%"}}>Returns an array containing headers of csv file</p>
                </div>
                <div className="os-header">
                  <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/package/state-utils"><h3 className="fw6 f4 black-90 dib lh-solid ma0 no-underline hover-black">state-utils</h3></a>
                  <p style={{"marginTop":"1%"}}>A library for USPS code or state capital of states</p>
                </div>
              </div>
              <div className="col-sm-4">
                <h4 className="page-header">Research Papers</h4>
                <div className="os-header">
                  <a target="_blank" rel="noopener noreferrer" href="http://www.ijcee.org/papers/253-E676.pdf"><h3 className="fw6 f4 black-90 dib lh-solid ma0 no-underline hover-black">JPEG Steganography</h3></a>
                  <p style={{"marginTop":"1%"}}>It involves techniques of sending information inside a JPEG image</p>
                </div>
                <div className="os-header">
                  <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Elliptic-curve_cryptography"><h3 className="fw6 f4 black-90 dib lh-solid ma0 no-underline hover-black">Elliptic Curve Cryptography</h3></a>
                  <p style={{"marginTop":"1%"}}>Elliptic-curve cryptography (ECC) is based on the algebraic structure of elliptic curves over finite fields.</p>
                </div>
                <div className="os-header">
                  <a target="_blank" rel="noopener noreferrer" href="https://patents.google.com/patent/US9392144"><h3 className="fw6 f4 black-90 dib lh-solid ma0 no-underline hover-black">Video Synchronization</h3></a>
                  <p style={{"marginTop":"1%"}}>Techniques are disclosed for manipulating a media player based on the environment in which content is consumed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="companies" className="mast mast-teal">
          <div className="colored-container">
            <h3 className="h2">
              Companies
            </h3>
            <div className="colored-container">
              <h3>Active</h3>
              <hr className="separator" />
              <div className="logo-row">
                <div className="col-md-6">
                  <a target="_blank" rel="noopener noreferrer" href="http://www.zippia.com/">
                    <img height="100" src={zippia} alt="zippia" />
                  </a>
                  <h1>Zippia</h1>
                  <p style={{"color":"#ddd"}}>Lead Computer Scientist</p>
                </div>
                <div className="col-md-6">
                  <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/">
                    <img height="100" src={npm} alt="npm" />
                  </a>
                  <h1>NPM</h1>
                  <p style={{"color":"#ddd"}}>Software Engineer</p>
                </div>
              </div>
            </div>
            <div className="colored-container">
              <h3>Past</h3>
              <hr className="separator" />
              <div className="logo-row">
                <div className="col-md-6">
                  <a target="_blank" rel="noopener noreferrer" href="https://www.adobe.com/">
                    <img height="100" src={adobe} alt="adobe" />
                  </a>
                  <h1>Adobe</h1>
                  <p style={{"color":"#ddd"}}>Senior Software Engineer</p>
                </div>
                <div className="col-md-6">
                  <a target="_blank" rel="noopener noreferrer" href="https://motofix.in/">
                    <img height="100" src={motofix} alt="motofix" />
                  </a>
                  <h1>Motofix</h1>
                  <p style={{"color":"#ddd"}}>Software Architect, Lead Engineer</p>
                </div>
              </div>
              <div className="logo-row">
                <div className="col-md-6">
                  <a target="_blank" rel="noopener noreferrer" href="https://digitalguardian.com/">
                    <img height="100" src={digitalguardian} alt="DG" />
                  </a>
                  <h1>Digital Guardian</h1>
                  <p style={{"color":"#ddd"}}>Senior Software Engineer</p>
                </div>
                <div className="col-md-6">
                  <a target="_blank" rel="noopener noreferrer" href="https://newgensoft.com/">
                    <img height="100" src={newgen} alt="newgen" />
                  </a>
                  <h1>Newgen</h1>
                  <p style={{"color":"#ddd"}}>Software Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="social" className="mast mast-zeal">
          <div className="colored-container">
            <h3 className="h2">
              Connect
            </h3>
            <div className="colored-container">
              <a href="https://www.linkedin.com/in/luthrag/" target="_blank" rel="noopener noreferrer" className="fw6 create-space f4 black-90 dib lh-solid ma0 no-underline hover-black">
                <FontAwesomeIcon icon={faLinkedinIn} style={{"fontSize": "60px", "color":"#4875B4"}}/>
              </a>
              <a href="https://github.com/luthraG" target="_blank" rel="noopener noreferrer" className="fw6 create-space f4 black-90 dib lh-solid ma0 no-underline hover-black">
                <FontAwesomeIcon icon={faGithub} style={{"fontSize": "60px", "color":"#211F1F"}}/>
              </a>
              <a href="https://www.npmjs.com/~gluthra" target="_blank" rel="noopener noreferrer" className="fw6 create-space f4 black-90 dib lh-solid ma0 no-underline hover-black">
                <FontAwesomeIcon icon={faNpm} style={{"fontSize": "60px", "color":"#cc3534"}}/>
              </a>
              <a href="mailto:luthra.zenith@gmail.com" target="_blank" rel="noopener noreferrer" className="fw6 create-space f4 black-90 dib lh-solid ma0 no-underline hover-black">
                <FontAwesomeIcon icon={faEnvelope} style={{"fontSize": "60px", "color":"#c68642"}}/>
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
