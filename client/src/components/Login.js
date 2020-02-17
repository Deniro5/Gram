import React, { Component} from 'react';


class Login extends Component {

  state = {
    signin:true
  }

  signin = (status) => {
    this.refs.password.value = "";
    this.refs.email.value = "";
    this.refs.confirm.value = "";
    this.setState({
      signin: status
    })
  }

  onSubmit = () => {

 }

  submit = () => {
    if (this.state.signin) {
      fetch('http://localhost:8000/users/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "email": this.refs.email.value,
            "password": this.refs.password.value
        })
      })
      .then((res) => res.json())
      .then((json) => {
            if (json.message === "Auth successful") {
              localStorage.setItem("token",json.token);  
              //Take them to home here
              alert("login successful")
              this.props.history.push("/home")
            }
            else {
              alert("Incorrect Username and/or Password");
            }
      }); 
    }
    else {
      if (this.refs.password.value === this.refs.confirm.value) {
          fetch('http://localhost:8000/users/signup', {
            method: 'post',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
           },
           body: JSON.stringify({
               "email": this.refs.email.value,
               "password": this.refs.password.value ,
           })
         })
         .then((res) => res.json())
         .then((json) => {
               if (json.message === "user created") { 
                //generate and store token if successful   
                localStorage.setItem("token",json.token); 
                alert("login successful")
                this.props.history.push("/home")
               }
               else {
                 alert(json.message);
               }
             }); 
      }
      else {
        alert("Passwords do not match")
      }
    }
  }



  render() {

    var margTop = 0;
    if (this.state.signin) {
      margTop = 50
    }


    return (
        <div className = "loginContainer">
            <div className = "loginControls">
              <div className = "loginControlsTabContainer" > 
                <div onClick = {this.signin.bind(this,true)}  className = {"loginControlsTab " + (this.state.signin ? " " : "unselected")}>
                  <p> Sign In </p>
                </div>
                <div onClick = {this.signin.bind(this,false)}  className = {"loginControlsTab " + (this.state.signin ? "unselected" : " ")}>
                  <p> Register </p>
                </div>
                <div className = "loginFieldContainer" style = {{marginTop: margTop + "px"}}> 
                  <p> Email: </p>
                  <input ref= "email" placeholder = "Search..."/>
                </div>
                <div className = "loginFieldContainer"> 
                  <p> Password: </p>
                  <input  ref= "password"placeholder = "Search..." type = "password"/>
                </div>
                <div className = {"loginFieldContainer " + (this.state.signin ? "hidden" : " ")}> 
                  <p> Confirm Password: </p>
                  <input ref= "confirm" placeholder = "Search..." type = "password"/>
                </div>
                <button onClick = {this.submit}> Submit </button>
              </div>
            </div>
        </div>
    );
  }
}

export default Login;
