//import { ReactComponent } from '*.svg';
import './App.css';
import './macy.css';
import React from 'react';

var scriptjs = require('scriptjs');
scriptjs('https://projects.voyager89.net/en/image-search/macy.min.js', 'Macy');

class Output extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {
      imgDataOpacity: 0,
      imgDataLeft: 0,
      imgDataTop: 0,
      imgDataVisible: "hidden",
      imgDataWidth: 0,
      imageDataOutput: ""
    };

    this.showImage = this.showImage.bind(this);
    this.hideImageData = this.hideImageData.bind(this);
  }

  hideImageData(event)
  {
    event.preventDefault();

    this.setState({
      imgDataOpacity: 0,
      imgDataVisible: "hidden"
    });
  }

  // Show image data box, uploader, date, and different image sizes
  showImage(props)
  {
    const imageDate = props.target.dataset.timestamp;
    const imageTitle = props.target.attributes.title.textContent.trim().length > 1 ? props.target.attributes.title.textContent : <em>Image</em>;

    const imgDataOutput = (
      <div>
        <strong>{imageTitle.length > 35 ? imageTitle.substring(0, 35) + "..." : imageTitle}<br/>
        by <a className="imgdata" href={props.target.dataset.profile} rel="noreferrer" target="_blank">{props.target.dataset.name}</a></strong>
        <br/>
        <strong>{new Date(imageDate).toLocaleDateString()}</strong>
        <hr/><br/>
        <a className="imgdata" href={props.target.dataset.imgfull} rel="noreferrer" target="_blank">Full size</a><br/>
        <a className="imgdata" href={props.target.dataset.imgreg} rel="noreferrer" target="_blank">Regular size</a><br/>
        <a className="imgdata" href={props.target.dataset.small} rel="noreferrer" target="_blank">Small size</a><br/><br/>
        <hr/><br/>
        <a className="imgdata" href=":OK" onClick={this.hideImageData}>OK</a><br/><br/>
      </div>
    );

    this.setState(
    {
      imgDataLeft : ((document.body.offsetWidth / 2) - (350 / 2)),
      imgDataTop : window.scrollY + 100,//window.screen.width < 950 ? window.scrollY : window.innerHeight,
      imgDataOpacity : 1,
      imgDataVisible : "visible",
      imgDataWidth : props.target.naturalWidth,
      imageDataOutput : imgDataOutput
    });
  }

  removeNewline(data)
  {
    return data.replace(/\n/g, " ");
  }

  render()
  {
    const imgDataStyle = {
      backgroundColor:'rgb(255,255,255)',
      border: '5px #c0c0c0 outset',
      boxShadow: '0px 0px 100px #000',
      fontWeight: "bold",
      padding:	10,
      position: 	'absolute',
      left: 		this.state.imgDataLeft,
      top: 		this.state.imgDataTop,
      opacity: 	this.state.imgDataOpacity,
      visibility: this.state.imgDataVisible,
      width:		350,
      zIndex:	999
    };

    let output = [];
    let imageDataOutput = <div className="imagedata" style={imgDataStyle}>{this.state.imageDataOutput}</div>;

    const resultsData = this.props.data.results;

    let keyIterator = 0;

    for (const instance in resultsData)
    {
      ++keyIterator;

      let desc = "";
      let altDesc = "";

      const ins = resultsData[instance];
      const timestamp = ins.user.updated_at;
      const dName = ins.user.name;
      const dProfile = ins.user.links.html;
      const dFull = ins.urls.full;
      const dReg = ins.urls.regular;
      const dSma = ins.urls.small;
      const dSrc = ins.urls.thumb;

      if (ins.alt_description !== undefined && ins.alt_description != null)
        altDesc = ins.alt_description;

      if (ins.description !== undefined && ins.description != null)
        desc = this.removeNewline(ins.description);

      output.push(<img alt={altDesc} key={keyIterator} title={desc} onClick={this.showImage} data-timestamp={timestamp} data-name={dName} data-profile={dProfile} data-imgfull={dFull} data-imgreg={dReg} data-small={dSma} src={dSrc}/>);
    }

    return (
      <div className="outputdata">
        {imageDataOutput}
        <div className="imageOutput">
          {output}
        </div>
      </div>
    );
  }
}

class App extends React.Component
{
  constructor()
  {
    super();

    this.state = {
      totalPages : 0,
      outputData : "",
      currentPage : 1,
      searchCriteria : "",
      navigationLinks : "",
      navLinksPosition : 0,
      navLinksBackForwardVisibility : "hidden"
    }

    this.doSearch = this.doSearch.bind(this);
    this.returnKey = this.returnKey.bind(this);
    this.isStrJSON = this.isStrJSON.bind(this);
    this.showCriteria = this.showCriteria.bind(this);
    this.inputCriteria = this.inputCriteria.bind(this);
    this.showNavigation = this.showNavigation.bind(this);
    this.pageNavigation = this.pageNavigation.bind(this);
    this.getNavLinksPosition = this.getNavLinksPosition.bind(this);
  }

  aboutBox(event)
  {
    event.preventDefault();
    window.alert("Image Searching application\n\n- built with ReactJS\n- using the Unsplash API (www.unsplash.com)\n\nInitially released on 15 September 2020\nupdated on 18 June 2021.");
  }

  isStrJSON(str)
  {
    try {
      JSON.parse(str);
    }
    catch (e)
    {
      return false;
    }

    return true;
  }

  // Display the Page buttons
  showNavigation(totalPages)
  {
    let output = [];
    let outputBoxWidth = 0;

    for (let i = 1; i <= totalPages; ++i)
    {
      outputBoxWidth += 50;
      const linkKey = `navLink_${i}`;
      const navLinkClass = `nav${i === this.state.currentPage ? ' sel' : ''}`;

      output.push(
        <a className={navLinkClass} data-page-id={i} href=":Navigate" key={linkKey} onClick={this.doSearch}>{i}</a>
      );
    }

    this.setState({
      navLinksWidth : outputBoxWidth
    }, () =>
    {
      this.setState({
        navLinksBackForwardVisibility : "visible",
        navigationLinks : output
      });
    });
  }

  getNavLinksPosition()
  {
    return Number(this.state.navLinksPosition);
  }

  pageNavigation(props)
  {
    props.preventDefault();

    if (props.target.dataset.pageId)
    {
      switch(props.target.dataset.pageId)
      {
        case "next":
          if (this.getNavLinksPosition() < (Number(this.state.navLinksWidth) - 600))
          {
            this.setState({
              navLinksPosition : (this.getNavLinksPosition() + 50)
            });
          }
        break;
        case "previous":
          if (this.getNavLinksPosition() > 0)
          {
            this.setState({
              navLinksPosition : (this.getNavLinksPosition() - 50)
            });
          }
        break;
        default: break;
      }
    }
  }

  doSearch(props)
  {
    props.preventDefault();

    if (this.state.searchCriteria.trim().length)
    {
      let goToPage = 1;
      let searchType = "";

      // Change the page of the current search
      if (props && props.target.dataset.pageId)
      {
        goToPage = props.target.dataset.pageId;

        searchType = <strong style={{fontSize: 36}}>Loading page {goToPage}...</strong>;

        this.setState({
          currentPage : Number(goToPage)
        });
      }
      else {
        // New search
        this.setState({
          currentPage : 1
        });
        searchType = <strong style={{fontSize: 36}}>Searching in progress, please wait...</strong>;
      }

      this.setState({
        outputData : searchType
      });

      // FIX BELOW - REMOVE ALLOW CORS FROM PHP FILE
      window.fetch(`https://projects.voyager89.net/en/image-search/call-api.php?query=${this.state.searchCriteria.trim()}&page=${goToPage}`)
      .then(res => res.json())
      .then(
        (result) => {
          let errorFlag = 0;
          let outputDataReceived = null;

          if (typeof(result) == "string")
          {
            // Process data
            if (result.indexOf("Attention!") === 0)
            {
              errorFlag = 1;
              outputDataReceived = <strong style={{fontSize: 36}}>{result}</strong>;
            }
            else if (result.indexOf("Rate Limit Exceeded") === 0)
            {
              errorFlag = 1;
              outputDataReceived = <strong style={{fontSize: 36}}>Sorry: Rate limit has been exceeded. Up to 50 searches per hour allowed.</strong>;
            }
          }
          else if (typeof(result) == "object")
          {
            if (result.results && Array.isArray(result.results))
            {
              outputDataReceived = <Output data={result}/>;
            }
            else {
              errorFlag = 1;
              outputDataReceived = <strong style={{fontSize: 36}}>Error: Request could not be completed. Please try again later. If problem persists, please contact admin.</strong>;										
            }
          }
          else {
            errorFlag = 1;
            outputDataReceived = <strong style={{fontSize: 36}}>Error: Request could not be completed. Please try again later. If problem persists, please contact admin.</strong>;
          }

          if (!errorFlag)
          {
            //console.log("Sorting images!");

            this.showNavigation(Number(result.total_pages));
          }

          this.setState({
            outputData : <div>{outputDataReceived}</div>,
            totalPages : result.total_pages
          }, () =>
          {
            window.Macy({
              container: '.imageOutput',
              trueOrder: false,
              waitForImages: false,
              margin: 24,
              columns: 6,
              breakAt: {
                1200: 5,
                940: 3,
                520: 2,
                400: 1
              }
            });
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            outputData : (
              <strong style={{fontSize: 36}}>
                Error: {error}.
              </strong>
            )
          });
        }
      );
    }
  }

  inputCriteria(evt)
  {
    // Sanitize input
    let input = evt.target.value;
    input = input.replace(/\\/g, "");
    input = input.replace(/\//g, "");
    input = input.replace(/'/g, "");
    input = input.replace(/"/g, "");

    this.setState({searchCriteria: input});
  }

  returnKey(event)
  {
    if (event.key === "Enter" && this.state.searchCriteria.trim().length)
    {
      this.doSearch(event);
    }
  }

  showCriteria()
  {
    let output = "";
    const criteria = this.state.searchCriteria;
    output = criteria.trim().length ? criteria : "";

    return (output.length > 10 ? output.substring(0, 10) + "..." : output);
  }

  magnifyingGlass()
  {
    return new DOMParser().parseFromString('&#X1F50D;', 'text/html').body.textContent;
  }

  render()
  {
    return (
      <div className="App">
        <nav>
          <a href=":About" onClick={this.aboutBox}>About</a>
        </nav>
        <main>
          <h1>
            Unsplash Image Search<br/>
            &nbsp;{this.showCriteria()}&nbsp;
          </h1>

          <section className="search">
            <a href=":Search" onClick={this.doSearch}>{this.magnifyingGlass()}</a>
            <input id="imageQuery" onChange={this.inputCriteria} maxLength="20" onKeyDown={this.returnKey} placeholder="Free hi-res photos" title="Search here (press Enter)" type="text" defaultValue=""/>
          </section>
          <section className="outputNavigation">
            <a className="nav pageNavigate" data-page-id="previous" href=":Previous" onClick={this.pageNavigation} style={{visibility: this.state.navLinksBackForwardVisibility}}>&lt;&lt;</a>
            <div id="navLinksBox">
              <div style={{position: "relative", right: this.state.navLinksPosition, width: this.state.navLinksWidth}}>
                {this.state.navigationLinks}
              </div>
            </div>
            <a className="nav pageNavigate" data-page-id="next" href=":Next" onClick={this.pageNavigation} style={{visibility: this.state.navLinksBackForwardVisibility}}>&gt;&gt;</a>
          </section>
          <section className="output">
            {this.state.outputData}
          </section>
        </main>
      </div>
    );
  }
}

export default App;
