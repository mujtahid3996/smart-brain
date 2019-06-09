import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Logo from './Components/Logo/Logo';
import Signin from './Components/Signin/Signin';
import './App.css';
import Particles from 'react-particles-js';
import Register from './Components/Register/Register';

const particlesOption={
  particles: {
    number: {
    value: 70,
    density:
    {
      enable:true,
      value_area:1000
    }
    }
  }
}
const initialstate = {
     input: '',
      imageurl: '',
      box : {},
      route : 'signin',
      isSignedIn :false,
      user: {
        id: '',
        name: '',
        password: '',
        email:'',
        entries: 0,
        joined: new Date()
      }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialstate;
  }
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email:data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width=  Number(image.width);
    const height= Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow :clarifaiFace.top_row * height,
      rightCol :width - (clarifaiFace.right_col * width),
      bottomRow:height -(clarifaiFace.bottom_row *height)
    }
  }
dispalyFaceBox= (box) =>{
  console.log(box);
  this.setState({box: box});
}
  onInputChange= (event) =>{
    this.setState({input: event.target.value});
  }
  onButtonSubmit= () => {
    this.setState({imageurl: this.state.input});
    fetch('https://thawing-brook-86034.herokuapp.com/imageurl',{
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({
              input:this.state.input
            })
          })
     .then (response => response.json())
     .then( response =>
      {
        if(response){
          fetch('https://thawing-brook-86034.herokuapp.com/image',{
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({
              id:this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count =>{
            Object.assign(this.state.user,{entries:count})
          })
          .catch(console.log)
        }
      this.dispalyFaceBox(this.calculateFaceLocation(response))})
     .catch(err =>  console.log(err));
    
  }
  onRouteChange= (route) =>{
    if(route === 'signout')
    {
      this.setState(initialstate)
    }
    else if(route === 'home')
    {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }
  render() {
    return (
      <div className="App">
        <Particles className='particles'
              params={ particlesOption }
            />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
         { this.state.route === 'home'
        ? <div> 
              <Logo/>
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition box={this.state.box} imageurl = {this.state.imageurl}/>
          </div>
        : (
          this.state.route === 'signin'
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :
          <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )  
         }  
      </div>
    );
  }
}

export default App;
