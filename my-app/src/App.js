import React from 'react'
import './App.css'
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // current number of switches
      switchCount: 0,
      // object with each switch as a numerical key (e.g. first switch is 0) and the switch data as value
      switchStorage: {},
      // array of the selects between switches
      metaLogic: [],
      // state of the final button
      appState: false,
      // lets app know that there's an autoplay going on
      demoInProcess: false
    }
  }

  reduceSwitches = () => {
    // performs logic across the switches, called anytime a logical change is made

    // if there's no switch, revert to false
    if (!this.state.switchStorage[0]) {
      this.setState({ appState: false })
    } else {
      // if there's only one switch, final switch is the first switch status
      if (!this.state.metaLogic.length) {
        this.setState({ appState: this.state.switchStorage[0]['switchStatus'] })
        return
      }
      // otherwise iterate through the statuses of the switches + the metaLogic between them. temp variable contains the temp state.
      let temp
      for (let i = 0; i <= this.state.metaLogic.length - 1; i++) {
          temp = this.switchLogic(
            i === 0 ? this.state.switchStorage[i]['switchStatus'] : temp,
            this.state.switchStorage[i + 1]['switchStatus'],
            this.state.metaLogic[i])
        }
        this.setState({ appState: temp }) 
      }
  
  }

  clearApp = (e) => {
    
    if (e && this.state.demoInProcess) return
    this.setState({
      switchCount: 0,
      switchStorage: {},
      metaLogic: [],
      appState: false
    })
  }

  playSample = () => {

    // prevent errors from someone mashing the demo button
    if (this.state.demoInProcess) return
    this.setState({ demoInProcess: true})

    let addSwitch = () => { this.addSwitch() }
    let clearApp = () => { this.clearApp() }
    let pressTopLeft = () => { this.clickButton('left', 0) }
    let pressTopRight = () => { this.clickButton('right', 0) }
    let pressBottomLeft = () => { this.clickButton('left', 1) }
    let pressBottomRight = () => { 
      this.clickButton('right', 1)
      // final action, so we can end demoInProcess
      this.setState({ demoInProcess: false })
    }

    // sequence of demo actions
    window.setTimeout(clearApp, 0)
    window.setTimeout(addSwitch, 500)
    window.setTimeout(pressTopLeft, 1000)
    window.setTimeout(pressTopRight, 2000)
    window.setTimeout(addSwitch, 3000)
    window.setTimeout(pressBottomLeft, 4000)
    window.setTimeout(pressBottomRight, 5000)
  }

  addSwitch = (e) => {
    // if it comes from a click event + a demo is in process, return
    if (e && this.state.demoInProcess) return
    // no metaLogic gates for first switch
    if (this.state.switchCount) {
      let newMeta = this.state.metaLogic  
      newMeta.push('and')
      this.setState({ metaLogic: newMeta })
    }
    // default switch data for every new switch
    let defaultSwitchState = {
      left: false,
      right: false,
      logic: 'and',
      switchStatus: false
    }
    let tempStorage = this.state.switchStorage
    // new switch gets the default switch data
    tempStorage[this.state.switchCount] = defaultSwitchState
    this.setState({
      switchCount: this.state.switchCount + 1,
      switchStorage: tempStorage
    })
    // see if that alters the switch chain result
    this.reduceSwitches()
  }

  delSwitch = () => {
    // no deleting while demo
    if (this.state.demoInProcess) return

    // can't delete things that aren't there
    if (this.state.switchCount === 0) return
    else {
      // get rid of last object in switchStorage, last thing in metaLogic array
      let tempStorage = this.state.switchStorage
      delete tempStorage[this.state.switchCount - 1]
      let tempMeta = this.state.metaLogic
      tempMeta.pop()
      // reset state
      this.setState({
        switchStorage: tempStorage,
        switchCount: this.state.switchCount - 1,
        metaLogic: tempMeta
      })
      // see if that alters the switch chain result
      this.reduceSwitches()
    }
  }

  clickButton = (side, id) => {
    // otherwise, save a copy of switchStorage object
    let tempSwitchStorage = this.state.switchStorage
    // switch bool for the button in question
    tempSwitchStorage[id][side] = !tempSwitchStorage[id][side]
    // rerun switchLogic to get the new switch status
    tempSwitchStorage[id]['switchStatus'] = this.switchLogic(
      tempSwitchStorage[id]['left'],
      tempSwitchStorage[id]['right'],
      tempSwitchStorage[id]['logic']
    )
    // setState with new button state / switch results
    this.setState({ switchStorage: tempSwitchStorage })
    // see if that alters the switch chain result
    this.reduceSwitches()
  }

  changeSelect = (id, eventTargetValue) => {
    // make a copy of switchStorage obj, put the change in there
    let tempSwitchStorage = this.state.switchStorage
    tempSwitchStorage[id]['logic'] = eventTargetValue

    // check to see if that altered the status
    tempSwitchStorage[id]['switchStatus'] = this.switchLogic(
      tempSwitchStorage[id]['left'],
      tempSwitchStorage[id]['right'],
      tempSwitchStorage[id]['logic']
    )
    // set state with above changes
    this.setState({ switchStorage: tempSwitchStorage })
    // now see if that alters the switch chain result
    this.reduceSwitches()
  }

  changeMetaSelect = (idx, eventTargetValue) => {
    // saves the select-gate changes between switches to state
    let temp = this.state.metaLogic
    temp[idx - 1] = eventTargetValue
    this.setState({ metaLogic: temp })
    // see if that alters the switch chain result
    this.reduceSwitches()
  }

  renderSwitch = id => {
    return (
      <div>
      <div>Switch Number {parseInt(id)+1}</div>
      <Switch
        key={id}
        id={id}
        data={this.state.switchStorage[id]}
        clickButton={this.clickButton}
        changeSelect={this.changeSelect}
        logicState={this.state}
      />
      </div>
    )
  }

  getButtonClassName = switchState =>
    switchState ?  'button switchedOn' : 'button switchedOff'

  switchLogic = (s1, s2, logic) => {
    // same switch logic function from original app
    switch (logic) {
      case 'or':
        return s1 || s2
      case 'xor':
        return (s1 || s2) && !(s1 && s2)
      case 'and':
        return s1 && s2
      default:
        return false
    }
  }

  convertBool = bool => (bool ? 'ON' : 'OFF')

  render() {
    return (
      <div className="app">
        <div className="explainerText">
          <RenderExplainerText />
        </div>
        <div className="rightBox">
          <RenderAppInstructions />
          <div className="buttonContainer">
            <button onClick={this.addSwitch} className='menu-button'>Add New Switch</button>
            <button onClick={this.delSwitch} className='menu-button'>Delete Switch</button>
            <button onClick={this.playSample} className='menu-button'>Demo Usage</button>
            <button onClick={this.clearApp} className='menu-button'>Restart App</button>
          </div>
          <div>
            {Object.keys(this.state.switchStorage).map(
              id =>
                // if it's the first switch, don't render the logic gate on top of it
                id === '0' ? (<div key={'div-key' + id}>
                  {this.renderSwitch(id)}
                  </div>
                ) : (
                  // otherwise render the logic and a new switch under it
                  <div key={'div-key' + id} >
                    <Logic
                      key={'logic-key' + id}
                      id={id}
                      changeMetaSelect={this.changeMetaSelect}
                    />
                    {this.renderSwitch(id)}
                  </div>
                )
            )}
          </div>
          <div className="metaLogic">
            <div className="metaContainer">
              <div>=</div>
              <br />
              <div>Combined state</div>
              <button className={this.getButtonClassName(this.state.appState)}>
                {this.convertBool(this.state.appState)}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class Switch extends React.Component {
  // Individual switches, each comes with two buttons, the select and the state button

  clickLeft = () => {
    this.props.clickButton('left', this.props.id)
  }
  clickRight = () => {
    this.props.clickButton('right', this.props.id)
  }
  changeSelect = event => {
    this.props.changeSelect(this.props.id, event.target.value)
  }
  convertBool = bool => (bool ? 'ON' : 'OFF')

  getButtonClassName = switchState =>
    switchState ?  'button switchedOn' : 'button switchedOff'

  render() {
    return (
      <div className="switchRow">
        <button
          onClick={this.clickLeft}
          className={this.getButtonClassName(this.props.data.left)}
        >
          {this.convertBool(this.props.data.left)}
        </button>
        <select onChange={this.changeSelect}
        >
          <option value="and">and</option>
          <option value="or">or</option>
          <option value="xor">xor</option>
        </select>
        <button
          onClick={this.clickRight}
          className={this.getButtonClassName(this.props.data.right)}
        >
          {this.convertBool(this.props.data.right)}
        </button>
        <div>=</div>
        <button
          className={this.getButtonClassName(this.props.data.switchStatus)}
        >
          {this.convertBool(this.props.data.switchStatus)}
        </button>
      </div>
    )
  }
}

class Logic extends React.Component {
  // Used for the logic gates between switches

  changeSelect = event => {
    this.props.changeMetaSelect(this.props.id, event.target.value)
  }

  render() {
    return (
      <div className="metaLogic">
        <select className="metaLogic-select" onChange={this.changeSelect}>
          <option value="and">and</option>
          <option value="or">or</option>
          <option value="xor">xor</option>
        </select>
      </div>
    )
  }
}

class RenderExplainerText extends React.Component {
  render() {
    return (
      <div className="explainerTextContainer">
        <div className="headerTitle">Intro To Logic Gates</div>
        <div>
          <div className="explainerTitle">Logic Gates</div>
          Logic gates perform basic logical functions and are the fundamental
          building blocks of digital integrated circuits. Most logic gates take
          an input of two binary values, and output a single value of a 1 or 0.
        </div>
        <div>
          <div className="explainerTitle">AND GATE</div>
          An AND gate is a digital logic gate with two or more inputs and one
          output that performs logical conjunction. The output of an AND gate is
          true only when all of the inputs are true. If one or more of an AND
          gate's inputs are false, then the output of the AND gate is false.
        </div>
        <br />
        <div>
          <div className="explainerTitle">OR GATE</div>
          An OR gate is a digital logic gate with two or more inputs and one
          output that performs logical disjunction. The output of an OR gate is
          true when one or more of its inputs are true. If all of an OR gate's
          inputs are false, then the output of the OR gate is false.
        </div>
        <br />
        <div>
          <div>
            <div className="explainerTitle">XOR GATE</div>
          </div>
          An XOR gate (sometimes referred to by its extended name, Exclusive OR
          gate) is a digital logic gate with two or more inputs and one output
          that performs exclusive disjunction. The output of an XOR gate is true
          only when exactly one of its inputs is true. If both of an XOR gate's
          inputs are false, or if both of its inputs are true, then the output
          of the XOR gate is false.
        </div>
        <br />
      </div>
    )
  }
}

class RenderAppInstructions extends React.Component {
  render() {
    return (
      <div className='circuit-text'>
      <div className='info-alert'>
        !
      </div>
          <p>
            The app below helps demonstrate the functionality of combined
            circuits. New circuits can be added and their inputs and gate logic can be modified. The outputs of the various switches is combined top down using the gates between them
            for a final value at the bottom.
          </p>
      </div>
    )
  }
}

export default App