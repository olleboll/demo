import React, { Component } from 'react'

import './index.css'

class Stats extends Component {
  constructor(){
    super()
    this.loop = this.loop.bind(this)
  }
  componentDidMount(){
    this.loop()
  }
  
  loop(time){
    requestAnimationFrame((t) => this.loop(t))
    if(!this.lastCalledTime) {
      this.lastCalledTime = time;
      this.fpsValues = [];
      return;
    }
    let delta = (time - this.lastCalledTime)/1000;
    this.lastCalledTime = time;
    let fps = 1/delta;
    
    this.fpsValues.push(fps)
    if (this.fpsValues.length > 20) {
      const fps = this.fpsValues.reduce((acc, v) => acc+v, 0) / this.fpsValues.length
      if (!document.getElementById("fps")) return
      document.getElementById("fps").innerHTML = `FPS: ${parseInt(fps)}`
      this.fpsValues = this.fpsValues.slice(500)
    }
  }
  
  render(){
    return (
      <div className="stats" >
        <div id="fps"></div>
      </div>
    )
  }
}

export default Stats
